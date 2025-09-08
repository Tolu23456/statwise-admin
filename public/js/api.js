// API client for the admin panel

class API {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('admin-token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('admin-token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('admin-token');
  }

  // Get headers for requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url);
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }
    return response;
  }

  async logout() {
    await this.post('/auth/logout');
    this.clearToken();
  }

  async checkAuth() {
    return this.get('/auth/me');
  }

  // User management methods
  async getUsers(params = {}) {
    return this.get('/users', params);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id, data) {
    return this.put(`/users/${id}`, data);
  }

  async suspendUser(id, suspended, reason = '') {
    return this.post(`/users/${id}/suspend`, { suspended, reason });
  }

  async getUserStats() {
    return this.get('/users/stats/overview');
  }

  // Subscription methods
  async getSubscriptionOverview() {
    return this.get('/subscriptions/overview');
  }

  async getTransactions(params = {}) {
    return this.get('/subscriptions/transactions', params);
  }

  async getSubscriptionEvents(params = {}) {
    return this.get('/subscriptions/events', params);
  }

  async getRevenueAnalytics(period = '30d') {
    return this.get('/subscriptions/analytics/revenue', { period });
  }

  // Referral methods
  async getReferralOverview() {
    return this.get('/referrals/overview');
  }

  async getReferrals(params = {}) {
    return this.get('/referrals', params);
  }

  async getReferralAnalytics(period = '30d') {
    return this.get('/referrals/analytics', { period });
  }

  async updateReferralReward(id, rewardAmount, claimed) {
    return this.put(`/referrals/${id}/reward`, { rewardAmount, claimed });
  }

  // Prediction methods
  async getPredictionOverview() {
    return this.get('/predictions/overview');
  }

  async getPredictionResults(params = {}) {
    return this.get('/predictions/results', params);
  }

  async getPredictionAnalytics(period = '30d') {
    return this.get('/predictions/analytics', { period });
  }

  async updatePredictionResult(id, actualResult, accuracy) {
    return this.put(`/predictions/${id}`, { actualResult, accuracy });
  }

  // Admin methods
  async getAdminUsers() {
    return this.get('/admin/users');
  }

  async createAdminUser(data) {
    return this.post('/admin/users', data);
  }

  async updateAdminUser(id, data) {
    return this.put(`/admin/users/${id}`, data);
  }

  async getSystemLogs(params = {}) {
    return this.get('/admin/logs', params);
  }

  async getAppSettings() {
    return this.get('/admin/settings');
  }

  async updateAppSetting(key, value, description) {
    return this.put(`/admin/settings/${key}`, { value, description });
  }
}

// Create global API instance
window.api = new API();
