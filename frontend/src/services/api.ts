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

  async getForumPost(postId: string) {
    return this.request(`/forum/posts/${postId}`);
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

  async addForumComment(postId: string, content: string) {
    return this.request(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deleteForumPost(postId: string) {
    return this.request(`/forum/posts/${postId}`, {
      method: 'DELETE',
    });
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
    description?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
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
}

export const apiService = new ApiService();