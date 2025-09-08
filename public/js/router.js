// Client-side router for SPA navigation

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.init();
  }

  // Initialize router
  init() {
    // Register routes
    this.register('dashboard', () => window.dashboard.render());
    this.register('users', () => window.users.render());
    this.register('subscriptions', () => window.subscriptions.render());
    this.register('referrals', () => window.referrals.render());
    this.register('predictions', () => window.predictions.render());
    this.register('settings', () => window.settings.render());

    // Setup navigation handlers
    this.setupNavigation();
    this.setupSidebar();
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const route = window.location.hash.slice(1) || 'dashboard';
      this.navigate(route, false);
    });
  }

  // Register a route
  register(path, handler) {
    this.routes.set(path, handler);
  }

  // Navigate to a route
  navigate(path, pushState = true) {
    if (!this.routes.has(path)) {
      console.warn(`Route not found: ${path}`);
      path = 'dashboard';
    }

    // Update URL
    if (pushState) {
      window.history.pushState({}, '', `#${path}`);
    }

    // Update current route
    this.currentRoute = path;

    // Update navigation state
    this.updateNavigation(path);
    this.updateBreadcrumb(path);

    // Execute route handler
    try {
      Utils.showLoading();
      const handler = this.routes.get(path);
      handler();
    } catch (error) {
      console.error(`Error rendering route ${path}:`, error);
      this.showError('Failed to load page. Please try again.');
    } finally {
      Utils.hideLoading();
    }
  }

  // Setup navigation click handlers
  setupNavigation() {
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('[data-route]');
      if (navLink) {
        e.preventDefault();
        const route = navLink.getAttribute('data-route');
        this.navigate(route);
      }
    });
  }

  // Setup sidebar toggle and responsive behavior
  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // Sidebar toggle handler
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('sidebar-collapsed');
      
      // Store sidebar state
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebar-collapsed', isCollapsed);
    });

    // Restore sidebar state
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('sidebar-collapsed');
    }

    // Handle responsive sidebar on mobile
    this.handleResponsiveSidebar();
  }

  // Handle responsive sidebar behavior
  handleResponsiveSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // Mobile: sidebar should be hidden by default
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
      } else {
        // Desktop: restore saved state
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        sidebar.classList.toggle('collapsed', isCollapsed);
        mainContent.classList.toggle('sidebar-collapsed', isCollapsed);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnToggle = document.getElementById('sidebarToggle').contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && !sidebar.classList.contains('collapsed')) {
          sidebar.classList.add('collapsed');
          mainContent.classList.add('sidebar-collapsed');
        }
      }
    });
  }

  // Update navigation active state
  updateNavigation(path) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current route
    const activeLink = document.querySelector(`[data-route="${path}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  // Update breadcrumb
  updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    const pathNames = {
      'dashboard': 'Dashboard',
      'users': 'User Management',
      'subscriptions': 'Subscriptions & Payments',
      'referrals': 'Referral System',
      'predictions': 'Predictions',
      'settings': 'Settings'
    };

    const pathName = pathNames[path] || 'Dashboard';
    breadcrumb.innerHTML = `<li class="breadcrumb-item active">${pathName}</li>`;
  }

  // Show error page
  showError(message) {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="error-message">
              <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <h4>Oops! Something went wrong</h4>
              <p>${message}</p>
              <button class="btn btn-primary" onclick="window.router.navigate('dashboard')">
                <i class="fas fa-home me-2"></i>Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Get current route
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.router = new Router();
});
