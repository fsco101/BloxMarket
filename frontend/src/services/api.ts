const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('bloxmarket-token');
    // Add debug logging
    console.log('ApiService initialized with token:', this.token ? 'present' : 'missing');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (like error messages)
        const text = await response.text();
        data = { error: text };
      }

      if (!response.ok) {
        throw new Error(data.error || data || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      // If it's a parsing error, provide a more helpful message
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new Error('Server returned invalid response. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // Auth methods
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
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async login(credentials: { username: string; password: string }) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
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
    const formData = new FormData();
    formData.append('itemOffered', tradeData.itemOffered);
    if (tradeData.itemRequested) formData.append('itemRequested', tradeData.itemRequested);
    if (tradeData.description) formData.append('description', tradeData.description);
    
    // Add images to FormData
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return this.request('/trades', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
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

  async updateTrade(tradeId: string, tradeData: {
    itemOffered: string;
    itemRequested?: string;
    description?: string;
  }, images?: File[]) {
    const formData = new FormData();
    formData.append('itemOffered', tradeData.itemOffered);
    if (tradeData.itemRequested) formData.append('itemRequested', tradeData.itemRequested);
    if (tradeData.description) formData.append('description', tradeData.description);
    
    // Add images to FormData
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return this.request(`/trades/${tradeId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  async updateTradeStatus(tradeId: string, status: string) {
    return this.request(`/trades/${tradeId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteTrade(tradeId: string) {
    return this.request(`/trades/${tradeId}`, {
      method: 'DELETE',
    });
  }

  async getUserTrades(userId: string) {
    return this.request(`/trades/user/${userId}`);
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
    return this.request('/users/me');
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

  async getAllUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return this.request(`/admin/users?${queryString}`);
  }

  async getReports(params?: { page?: number; limit?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return this.request(`/admin/reports?${queryString}`);
  }

  async getFlaggedPosts(params?: { page?: number; limit?: number; severity?: string }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return this.request(`/admin/flagged-posts?${queryString}`);
  }

  async getVerificationRequests(params?: { page?: number; limit?: number }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return this.request(`/admin/verification-requests?${queryString}`);
  }

  async banUser(userId: string, reason?: string) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'ban', reason }),
    });
  }

  async unbanUser(userId: string) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'unban' }),
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateReportStatus(reportId: string, status: string, action?: string) {
    return this.request(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, action }),
    });
  }

  async deleteFlaggedPost(postId: string) {
    return this.request(`/admin/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async approveVerification(userId: string, type: string) {
    return this.request(`/admin/verification/${userId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    });
  }

  async rejectVerification(userId: string) {
    return this.request(`/admin/verification/${userId}/reject`, {
      method: 'PATCH',
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('bloxmarket-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('bloxmarket-token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
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
}

export const apiService = new ApiService();