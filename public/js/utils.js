// Utility functions for the admin panel

class Utils {
  // Format currency
  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format date
  static formatDate(dateString, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options })
      .format(new Date(dateString));
  }

  // Format relative time
  static formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return this.formatDate(dateString, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Format numbers with commas
  static formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }

  // Format percentage
  static formatPercentage(value, decimals = 1) {
    return `${Number(value).toFixed(decimals)}%`;
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Generate pagination info
  static getPaginationInfo(page, totalPages, totalItems, itemsPerPage) {
    const start = (page - 1) * itemsPerPage + 1;
    const end = Math.min(page * itemsPerPage, totalItems);
    
    return {
      start,
      end,
      total: totalItems,
      page,
      totalPages,
      showingText: `Showing ${start}-${end} of ${totalItems} items`
    };
  }

  // Get status badge class
  static getStatusBadgeClass(status) {
    const statusClasses = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'suspended': 'bg-danger',
      'premium': 'bg-primary',
      'vip': 'bg-warning',
      'vvip': 'bg-info',
      'successful': 'bg-success',
      'failed': 'bg-danger',
      'pending': 'bg-warning',
      'free': 'bg-secondary'
    };
    
    return statusClasses[status?.toLowerCase()] || 'bg-secondary';
  }

  // Show loading spinner
  static showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
  }

  // Hide loading spinner
  static hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
  }

  // Show toast notification
  static showToast(message, type = 'info') {
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }

    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  // Confirm dialog
  static async confirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const modalId = 'confirm-modal-' + Date.now();
      const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                ${message}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary confirm-btn">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modalElement = document.getElementById(modalId);
      const modal = new bootstrap.Modal(modalElement);

      modalElement.querySelector('.confirm-btn').addEventListener('click', () => {
        modal.hide();
        resolve(true);
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
        resolve(false);
      });

      modal.show();
    });
  }

  // Generate chart colors
  static getChartColors(count = 6) {
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', 
      '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  // Escape HTML
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Validate email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate random string
  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Download data as CSV
  static downloadCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
      this.showToast('No data to export', 'warning');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Theme management
  static setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  static getTheme() {
    return localStorage.getItem('admin-theme') || 'light';
  }

  static toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

// Export for use in other modules
window.Utils = Utils;
