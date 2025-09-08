// Authentication management

class Auth {
  constructor() {
    this.user = null;
    this.admin = null;
    this.loginModal = null;
  }

  // Initialize authentication
  init() {
    this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
      backdrop: 'static',
      keyboard: false
    });

    this.setupLoginForm();
    this.checkAuthStatus();
  }

  // Setup login form
  setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        loginError.classList.add('d-none');

        const response = await api.login(email, password);
        
        this.user = response.user;
        this.admin = response.admin;
        
        this.showMainInterface();
        this.loginModal.hide();
        
        Utils.showToast('Login successful!', 'success');
        
        // Load dashboard
        window.router.navigate('dashboard');
        
      } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message || 'Login failed. Please try again.';
        loginError.classList.remove('d-none');
      }
    });

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout();
    });
  }

  // Check authentication status
  async checkAuthStatus() {
    const token = localStorage.getItem('admin-token');
    
    if (!token) {
      this.showLoginModal();
      return;
    }

    try {
      const response = await api.checkAuth();
      
      this.user = response.user;
      this.admin = response.admin;
      
      this.showMainInterface();
      
      // Navigate to current route or dashboard
      const currentPath = window.location.hash.slice(1) || 'dashboard';
      window.router.navigate(currentPath);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      this.showLoginModal();
    }
  }

  // Show login modal
  showLoginModal() {
    document.getElementById('mainContainer').classList.add('d-none');
    this.loginModal.show();
  }

  // Show main interface
  showMainInterface() {
    document.getElementById('mainContainer').classList.remove('d-none');
    
    // Update admin info
    const adminEmail = document.getElementById('adminEmail');
    if (adminEmail && this.admin) {
      adminEmail.textContent = this.admin.email;
    }
  }

  // Logout
  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    this.user = null;
    this.admin = null;
    
    // Clear any cached data
    this.clearCache();
    
    // Show login modal
    this.showLoginModal();
    
    Utils.showToast('Logged out successfully', 'info');
  }

  // Clear cached data
  clearCache() {
    // Clear any cached dashboard data, charts, etc.
    if (window.dashboard) {
      window.dashboard.clearCharts();
    }
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.admin || !this.admin.permissions) {
      return false;
    }
    
    return this.admin.permissions.includes(permission) || 
           this.admin.role === 'super_admin';
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get current admin
  getCurrentAdmin() {
    return this.admin;
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.auth = new Auth();
  window.auth.init();
});
