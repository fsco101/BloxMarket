const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null;
  private verifyingOnce = false;

  constructor() {
    // Always try to get the most current token from localStorage
    this.token = localStorage.getItem('bloxmarket-token');
    console.log('ApiService initialized with token:', this.token ? 'present' : 'missing');
  }

  private async verifyTokenSilently(currentToken: string) {
    if (this.verifyingOnce) return false;
    this.verifyingOnce = true;
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      return resp.ok;
    } catch {
      return false;
    } finally {
      this.verifyingOnce = false;
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const currentToken = localStorage.getItem('bloxmarket-token') || this.token || null;

    const config: RequestInit = {
      // Important: spread options first so our merged headers don't get overwritten by options.headers
      ...options,
      headers: {
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : { error: await response.text() };

      if (!response.ok) {
        if (response.status === 401) {
          const errMsg = typeof data?.error === 'string' ? data.error : '';
          const isAuthError =
            errMsg === 'Access denied. No token provided.' ||
            errMsg === 'Token expired' ||
            errMsg === 'Invalid token' ||
            errMsg === 'Token verification failed' ||
            errMsg === 'User not found';

          if (isAuthError) {
            // Verify once to avoid false positives during navigation
            const ok = currentToken ? await this.verifyTokenSilently(currentToken) : false;
            if (!ok) {
              this.clearToken();
              window.dispatchEvent(new CustomEvent('auth-expired'));
              throw new Error('Session expired. Please log in again.');
            }
            // Token is valid; treat as access error for this endpoint
            throw new Error(data?.error || 'Access denied');
          }
        }
        if (response.status === 403) {
          const errMsg = typeof data?.error === 'string' ? data.error : '';
          if (errMsg === 'Account is banned' || errMsg === 'Account is deactivated') {
            this.clearToken();
            window.dispatchEvent(new CustomEvent('auth-expired'));
          }
          // Do NOT logout on 'Admin access required'
        }
        throw new Error(data?.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: { username: string; password: string }) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data?.token) {
      this.setToken(data.token);
      // Optional: persist user for faster UX on reload
      localStorage.setItem('bloxmarket-user', JSON.stringify(data.user));
    }
    return data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    robloxUsername?: string;
  }) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data?.token) {
      this.setToken(data.token);
      localStorage.setItem('bloxmarket-user', JSON.stringify(data.user));
    }
    return data;
  }

  // Keep using the protected route that hits backend middleware auth.js
  async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
  }

  async logoutAll() {
    await this.request('/auth/logout-all', {
      method: 'POST',
    });
    this.clearToken();
  }

  // Note: User methods are defined at the end of the class

  // Trade methods
  async getTrades(params?: { page?: number; limit?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return this.request(`/trades?${queryString}`);
  }

  async getTrade(tradeId: string) {
    return this.request(`/trades/${tradeId}`);
  }

  async createTrade(tradeData: {
    itemOffered: string;
    itemRequested?: string;
    description?: string;
  }, images?: File[]) {
    console.log('Creating trade:', tradeData);
    
    const formData = new FormData();
    formData.append('itemOffered', tradeData.itemOffered);
    if (tradeData.itemRequested) {
      formData.append('itemRequested', tradeData.itemRequested);
    }
    if (tradeData.description) {
      formData.append('description', tradeData.description);
    }
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    const token = localStorage.getItem('bloxmarket-token');
    const response = await fetch(`${API_BASE_URL}/trades`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create trade');
    }
    
    return await response.json();
  }

  async uploadTradeImages(images: File[]) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.request('/trades/upload-images', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  async deleteTradeImage(filename: string) {
    return this.request(`/trades/${filename}`, {
      method: 'DELETE',
    });
  }

  async updateTrade(
    tradeId: string,
    tradeData: { itemOffered: string; itemRequested?: string; description?: string },
    images?: File[] // images are ignored by backend on edit; route doesn't handle files
  ) {
    // Send JSON; backend updateTrade expects camelCase fields
    return this.request(`/trades/${tradeId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        itemOffered: tradeData.itemOffered,
        itemRequested: tradeData.itemRequested,
        description: tradeData.description,
      }),
    });
  }

  async updateTradeStatus(tradeId: string, status: string) {
    console.log('Updating trade status:', tradeId, status);
    
    const token = localStorage.getItem('bloxmarket-token');
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update trade status');
    }
    
    return await response.json();
  }

  async deleteTrade(tradeId: string) {
    console.log('Deleting trade:', tradeId);
    
    const token = localStorage.getItem('bloxmarket-token');
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete trade');
    }
    
    return await response.json();
  }

  async getUserTrades(userId: string) {
    console.log('Fetching trades for user:', userId);
    
    const token = localStorage.getItem('bloxmarket-token');
    const response = await fetch(`${API_BASE_URL}/trades/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get user trades error:', response.status, errorData);
      throw new Error(errorData.error || `Failed to fetch user trades: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User trades data:', data);
    
    // Handle different response formats
    if (data.trades && Array.isArray(data.trades)) {
      return data.trades;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  }

  // Forum methods
  async getForumPosts(params?: { page?: number; limit?: number; category?: string }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return this.request(`/forum/posts?${queryString}`);
  }

  // Get single forum post with comments - FIXED
  async getForumPost(postId: string) {
    console.log('Fetching forum post:', postId); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get forum post error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Forum post data:', data); // Debug log
    return data;
  }

  async createForumPost(postData: {
    title: string;
    content: string;
    category?: string;
  }, images?: File[]) {
    if (images && images.length > 0) {
      // Create FormData for image uploads
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.category) {
        formData.append('category', postData.category);
      }
      
      // Add images to FormData
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      return this.request('/forum/posts', {
        method: 'POST',
        body: formData,
      });
    } else {
      // No images, use regular JSON request
      return this.request('/forum/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    }
  }

  async updateForumPost(postId: string, postData: {
    title: string;
    content: string;
    category?: string;
  }, images?: File[]) {
    if (images && images.length > 0) {
      // Create FormData for image uploads
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.category) {
        formData.append('category', postData.category);
      }
      
      // Add images to FormData
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      return this.request(`/forum/posts/${postId}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // No images, use regular JSON request
      return this.request(`/forum/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
    }
  }

  async deleteForumPost(postId: string) {
    return this.request(`/forum/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async getForumComments(postId: string) {
    console.log('Fetching forum comments for:', postId);
    
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/comments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get forum comments error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Forum comments data:', data);
    return data;
  }

  async getForumVotes(postId: string) {
    console.log('Fetching forum votes for:', postId);
    
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/votes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get forum votes error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Forum votes data:', data);
    return data;
  }

  // Add forum comment - FIXED
  async addForumComment(postId: string, content: string) {
    console.log('Adding comment:', { postId, content }); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Add comment error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Comment response:', data); // Debug log
    return data;
  }

  // Forum voting - FIXED
  async voteForumPost(postId: string, voteType: 'up' | 'down') {
    console.log('Voting on post:', { postId, voteType }); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: JSON.stringify({ voteType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vote error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Vote response:', data); // Debug log
    return data;
  }

  // Event methods
  async getEvents() {
    return this.request('/events');
  }

  async getEvent(eventId: string) {
    return this.request(`/events/${eventId}`);
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    type: 'giveaway' | 'competition' | 'event';
    startDate: string;
    endDate: string;
    prizes?: string[];
    requirements?: string[];
    maxParticipants?: number;
  }, images?: File[]) {
    console.log('Creating event:', { eventData, imagesCount: images?.length || 0 });
    
    const formData = new FormData();
    
    // Add event data
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays (prizes, requirements)
          formData.append(key, value.join(', '));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add images
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
        // Don't set Content-Type - let browser set it for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Create event error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Create event response:', data);
    return data;
  }

  async updateEvent(eventId: string, eventData: {
    title: string;
    description: string;
    type: 'giveaway' | 'competition' | 'event';
    startDate: string;
    endDate: string;
    prizes?: string[];
    requirements?: string[];
    maxParticipants?: number;
  }, images?: File[], removeImages?: string[]) {
    console.log('Updating event:', { eventId, eventData, imagesCount: images?.length || 0, removeImages });
    
    const formData = new FormData();
    
    // Add event data
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, value.join(', '));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add images to remove
    if (removeImages && removeImages.length > 0) {
      removeImages.forEach(filename => {
        formData.append('removeImages', filename);
      });
    }
    
    // Add new images
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Update event error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Update event response:', data);
    return data;
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async joinEvent(eventId: string) {
    return this.request(`/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  async leaveEvent(eventId: string) {
    return this.request(`/events/${eventId}/leave`, {
      method: 'POST',
    });
  }

  // User profile methods
  async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  async getUserProfile(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(profileData: {
    username?: string;
    robloxUsername?: string;
    bio?: string;
    discordUsername?: string;
    timezone?: string;
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadAvatar(avatarFile: File) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    return this.request('/users/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async searchUsers(query: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/users/search/${encodeURIComponent(query)}${params}`);
  }

  async getUserWishlist(userId: string) {
    return this.request(`/users/${userId}/wishlist`);
  }

  async addToWishlist(itemName: string) {
    return this.request('/users/wishlist', {
      method: 'POST',
      body: JSON.stringify({ itemName }),
    });
  }

  async removeFromWishlist(wishlistId: string) {
    return this.request(`/users/wishlist/${wishlistId}`, {
      method: 'DELETE',
    });
  }

  // Admin methods
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);

    return this.request(`/admin/users?${queryParams.toString()}`);
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  async banUser(userId: string, action: 'ban' | 'unban', reason?: string) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason })
    });
  }

  async updateUserStatus(userId: string, action: 'activate' | 'deactivate', reason?: string) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason })
    });
  }

  async getVerificationRequests() {
    return this.request('/admin/verification-requests');
  }

  async approveVerification(userId: string, type: 'verified' | 'middleman') {
    return this.request(`/admin/verification/${userId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ type })
    });
  }

  async rejectVerification(userId: string, reason?: string) {
    return this.request(`/admin/verification/${userId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('bloxmarket-token', token);
    console.log('Token set in ApiService');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('bloxmarket-token');
    console.log('Token cleared from ApiService');
  }

  isAuthenticated(): boolean {
    return !!(this.token || localStorage.getItem('bloxmarket-token'));
  }

  // Get trade comments
  async getTradeComments(tradeId: string) {
    console.log('Fetching trade comments:', tradeId);
    
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/comments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get trade comments error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Trade comments data:', data);
    return data;
  }

  // Add trade comment
  async addTradeComment(tradeId: string, content: string) {
    console.log('Adding trade comment:', { tradeId, content });
    
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Add trade comment error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Trade comment response:', data);
    return data;
  }

  // Get trade votes
  async getTradeVotes(tradeId: string) {
    console.log('Fetching trade votes:', tradeId);
    
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/votes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get trade votes error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Trade votes data:', data);
    return data;
  }

  // Vote on trade post
  async voteTradePost(tradeId: string, voteType: 'up' | 'down') {
    console.log('Voting on trade:', { tradeId, voteType });
    
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: JSON.stringify({ voteType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vote trade error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Trade vote response:', data);
    return data;
  }

  // Event voting methods
  async getEventVotes(eventId: string) {
    console.log('Fetching event votes:', eventId);
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/votes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get event votes error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event votes data:', data);
    return data;
  }

  async voteEvent(eventId: string, voteType: 'up' | 'down') {
    console.log('Voting on event:', { eventId, voteType });
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: JSON.stringify({ voteType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vote event error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event vote response:', data);
    return data;
  }

  // Event comment methods
  async getEventComments(eventId: string) {
    console.log('Fetching event comments:', eventId);
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/comments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get event comments error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event comments data:', data);
    return data;
  }

  async addEventComment(eventId: string, content: string) {
    console.log('Adding event comment:', { eventId, content });
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('bloxmarket-token')}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Add event comment error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event comment response:', data);
    return data;
  }

  async getUserTradeHistory(userId: string) {
    console.log('Fetching trade history for user:', userId);
    
    try {
      const token = localStorage.getItem('bloxmarket-token');
      const response = await fetch(`${API_BASE_URL}/trades/user/${userId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Handle 404 specifically for missing routes
        if (response.status === 404) {
          console.warn('Trade history endpoint not implemented yet, returning empty array');
          return [];
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('Get user trade history error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch user trade history: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User trade history data:', data);
      
      // Handle different response formats
      if (data.trades && Array.isArray(data.trades)) {
        return data.trades;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user trade history:', error);
      // Return empty array instead of throwing for missing endpoints
      if (error.message.includes('Route not found') || error.message.includes('404')) {
        console.warn('Trade history endpoint not available, returning empty data');
        return [];
      }
      throw error;
    }
  }

  async getUserForumPosts(userId: string) {
    console.log('Fetching forum posts for user:', userId);
    
    try {
      const token = localStorage.getItem('bloxmarket-token');
      const response = await fetch(`${API_BASE_URL}/forum/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Handle 404 specifically for missing routes
        if (response.status === 404) {
          console.warn('User forum posts endpoint not implemented yet, returning empty array');
          return [];
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('Get user forum posts error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch user forum posts: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User forum posts data:', data);
      
      // Handle different response formats
      if (data.posts && Array.isArray(data.posts)) {
        return data.posts;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user forum posts:', error);
      // Return empty array instead of throwing for missing endpoints
      if (error.message.includes('Route not found') || error.message.includes('404')) {
        console.warn('User forum posts endpoint not available, returning empty data');
        return [];
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();