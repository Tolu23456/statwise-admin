// Main application initialization and coordination

class App {
  constructor() {
    this.initialized = false;
  }

  // Initialize application
  init() {
    if (this.initialized) return;

    try {
      // Initialize theme
      this.initializeTheme();
      
      // Initialize global event handlers
      this.setupGlobalHandlers();
      
      // Mark as initialized
      this.initialized = true;
      
      console.log('StatWise Admin Panel initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      Utils.showToast('Failed to initialize application', 'danger');
    }
  }

  // Initialize theme system
  initializeTheme() {
    // Set initial theme
    const savedTheme = Utils.getTheme();
    Utils.setTheme(savedTheme);

    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        Utils.toggleTheme();
      });
    }
  }

  // Setup global event handlers
  setupGlobalHandlers() {
    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      Utils.showToast('An unexpected error occurred', 'danger');
    });

    // Global error handler for JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
    });

    // Handle network status changes
    window.addEventListener('online', () => {
      Utils.showToast('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      Utils.showToast('Connection lost. Some features may not work.', 'warning');
    });

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Setup global click handlers for common actions
    this.setupGlobalClickHandlers();
  }

  // Setup keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search (if implemented)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          const modal = bootstrap.Modal.getInstance(openModal);
          if (modal) modal.hide();
        }
      }

      // Ctrl/Cmd + R to refresh current page data
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        const refreshBtn = document.querySelector('#refreshDashboard, [data-action="refresh"]');
        if (refreshBtn) {
          e.preventDefault();
          refreshBtn.click();
        }
      }
    });
  }

  // Setup global click handlers
  setupGlobalClickHandlers() {
    document.addEventListener('click', (e) => {
      // Handle data action buttons
      const actionButton = e.target.closest('[data-action]');
      if (actionButton) {
        this.handleDataAction(actionButton, e);
      }

      // Handle external links
      const externalLink = e.target.closest('a[href^="http"]');
      if (externalLink && !externalLink.hasAttribute('data-internal')) {
        externalLink.setAttribute('target', '_blank');
        externalLink.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // Handle data action buttons
  async handleDataAction(button, event) {
    event.preventDefault();
    
    const action = button.getAttribute('data-action');
    const target = button.getAttribute('data-target');
    const confirm = button.getAttribute('data-confirm');

    // Show confirmation if required
    if (confirm && !(await Utils.confirm(confirm))) {
      return;
    }

    try {
      Utils.showLoading();
      
      switch (action) {
        case 'refresh':
          await this.handleRefreshAction(target);
          break;
        case 'export':
          await this.handleExportAction(target);
          break;
        case 'delete':
          await this.handleDeleteAction(target, button);
          break;
        case 'toggle':
          await this.handleToggleAction(target, button);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Action failed:', error);
      Utils.showToast(error.message || 'Action failed', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Handle refresh actions
  async handleRefreshAction(target) {
    const currentRoute = window.router?.getCurrentRoute();
    
    if (target === 'dashboard' || currentRoute === 'dashboard') {
      if (window.dashboard) {
        await window.dashboard.loadDashboardData();
      }
    } else if (target === 'users' || currentRoute === 'users') {
      if (window.users) {
        await window.users.loadUsers();
      }
    } else if (target === 'subscriptions' || currentRoute === 'subscriptions') {
      if (window.subscriptions) {
        await window.subscriptions.loadData();
      }
    } else if (target === 'referrals' || currentRoute === 'referrals') {
      if (window.referrals) {
        await window.referrals.loadData();
      }
    } else if (target === 'predictions' || currentRoute === 'predictions') {
      if (window.predictions) {
        await window.predictions.loadData();
      }
    }
    
    Utils.showToast('Data refreshed successfully', 'success');
  }

  // Handle export actions
  async handleExportAction(target) {
    // This would be implemented based on the current page/data
    Utils.showToast('Export functionality not yet implemented', 'info');
  }

  // Handle delete actions
  async handleDeleteAction(target, button) {
    // This would be implemented based on the specific item being deleted
    Utils.showToast('Delete functionality handled by specific modules', 'info');
  }

  // Handle toggle actions
  async handleToggleAction(target, button) {
    // This would be implemented based on the specific toggle being performed
    Utils.showToast('Toggle functionality handled by specific modules', 'info');
  }

  // Get application info
  getInfo() {
    return {
      name: 'StatWise Admin Panel',
      version: '1.0.0',
      author: 'StatWise Team'
    };
  }

  // Clean up application resources
  cleanup() {
    // Clear any global intervals or event listeners
    if (window.dashboard) {
      window.dashboard.clearCharts();
    }
    
    this.initialized = false;
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.cleanup();
  }
});
