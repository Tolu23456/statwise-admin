// User management functionality

class Users {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 20;
    this.filters = {
      search: '',
      tier: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    this.users = [];
    this.totalUsers = 0;
  }

  // Render users page
  async render() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">User Management</h1>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="refreshUsers">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
            <button class="btn btn-primary btn-sm" id="exportUsers">
              <i class="fas fa-download me-2"></i>Export
            </button>
          </div>
        </div>

        <!-- User Statistics -->
        <div class="row mb-4" id="userStats">
          <!-- Stats will be loaded here -->
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="card-title mb-0">
                  <i class="fas fa-users me-2"></i>All Users
                </h5>
              </div>
              <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-md-end">
                  <input type="search" class="form-control form-control-sm" placeholder="Search users..." id="userSearch" style="max-width: 200px;">
                  <select class="form-select form-select-sm" id="tierFilter" style="max-width: 150px;">
                    <option value="">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="vvip">VVIP</option>
                  </select>
                  <select class="form-select form-select-sm" id="statusFilter" style="max-width: 150px;">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>
                      <button class="btn btn-link p-0 text-decoration-none" data-sort="display_name">
                        User <i class="fas fa-sort"></i>
                      </button>
                    </th>
                    <th>
                      <button class="btn btn-link p-0 text-decoration-none" data-sort="current_tier">
                        Tier <i class="fas fa-sort"></i>
                      </button>
                    </th>
                    <th>
                      <button class="btn btn-link p-0 text-decoration-none" data-sort="subscription_status">
                        Status <i class="fas fa-sort"></i>
                      </button>
                    </th>
                    <th>
                      <button class="btn btn-link p-0 text-decoration-none" data-sort="total_referrals">
                        Referrals <i class="fas fa-sort"></i>
                      </button>
                    </th>
                    <th>
                      <button class="btn btn-link p-0 text-decoration-none" data-sort="last_login">
                        Last Login <i class="fas fa-sort"></i>
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="usersTableBody">
                  <!-- Users will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <div id="usersPaginationInfo" class="text-muted small">
                <!-- Pagination info will be shown here -->
              </div>
              <nav>
                <ul class="pagination pagination-sm mb-0" id="usersPagination">
                  <!-- Pagination will be loaded here -->
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- User Details Modal -->
      <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user me-2"></i>User Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="userDetailsContent">
              <!-- User details will be loaded here -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Edit Modal -->
      <div class="modal fade" id="userEditModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-edit me-2"></i>Edit User
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="userEditForm">
              <div class="modal-body">
                <input type="hidden" id="editUserId">
                <div class="mb-3">
                  <label for="editDisplayName" class="form-label">Display Name</label>
                  <input type="text" class="form-control" id="editDisplayName" required>
                </div>
                <div class="mb-3">
                  <label for="editCurrentTier" class="form-label">Current Tier</label>
                  <select class="form-select" id="editCurrentTier">
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="vvip">VVIP</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="editSubscriptionStatus" class="form-label">Subscription Status</label>
                  <select class="form-select" id="editSubscriptionStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
    await this.loadUsers();
    await this.loadUserStats();
  }

  // Setup event handlers
  setupEventHandlers() {
    // Search input
    const searchInput = document.getElementById('userSearch');
    searchInput.addEventListener('input', Utils.debounce(() => {
      this.filters.search = searchInput.value;
      this.currentPage = 1;
      this.loadUsers();
    }, 300));

    // Filters
    document.getElementById('tierFilter').addEventListener('change', (e) => {
      this.filters.tier = e.target.value;
      this.currentPage = 1;
      this.loadUsers();
    });

    document.getElementById('statusFilter').addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.currentPage = 1;
      this.loadUsers();
    });

    // Sorting
    document.querySelectorAll('[data-sort]').forEach(button => {
      button.addEventListener('click', () => {
        const sortBy = button.getAttribute('data-sort');
        if (this.filters.sortBy === sortBy) {
          this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.filters.sortBy = sortBy;
          this.filters.sortOrder = 'asc';
        }
        this.loadUsers();
      });
    });

    // Refresh button
    document.getElementById('refreshUsers').addEventListener('click', () => {
      this.loadUsers();
    });

    // Export button
    document.getElementById('exportUsers').addEventListener('click', () => {
      this.exportUsers();
    });

    // User edit form
    document.getElementById('userEditForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveUserChanges();
    });
  }

  // Load user statistics
  async loadUserStats() {
    try {
      const stats = await api.getUserStats();
      
      const statsHtml = `
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(stats.totalUsers || 0)}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(stats.activeUsers || 0)}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(stats.newUsersThisMonth || 0)}</div>
            <div class="stat-label">New This Month</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-crown"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(Object.values(stats.tierDistribution || {}).reduce((sum, count) => sum + count, 0) - (stats.tierDistribution?.free || 0))}</div>
            <div class="stat-label">Premium Users</div>
          </div>
        </div>
      `;

      document.getElementById('userStats').innerHTML = statsHtml;
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  // Load users
  async loadUsers() {
    try {
      Utils.showLoading();
      
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.filters
      };

      const response = await api.getUsers(params);
      this.users = response.users || [];
      this.totalUsers = response.total || 0;

      this.renderUsersTable();
      this.renderPagination(response.page, response.totalPages);
      
    } catch (error) {
      console.error('Error loading users:', error);
      Utils.showToast('Failed to load users', 'danger');
      this.renderUsersTable([]);
    } finally {
      Utils.hideLoading();
    }
  }

  // Render users table
  renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    
    if (this.users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-users"></i>
              <p>No users found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = this.users.map(user => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3">
              ${(user.display_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="fw-semibold">${Utils.escapeHtml(user.display_name || 'Unknown')}</div>
              <small class="text-muted">${Utils.escapeHtml(user.email || '')}</small>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${Utils.getStatusBadgeClass(user.current_tier)}">${(user.current_tier || 'free').toUpperCase()}</span>
        </td>
        <td>
          <span class="badge ${Utils.getStatusBadgeClass(user.subscription_status)}">${(user.subscription_status || 'active').toUpperCase()}</span>
        </td>
        <td>
          <span class="fw-semibold">${user.total_referrals || 0}</span>
          ${user.total_referral_rewards ? `<br><small class="text-muted">${Utils.formatCurrency(user.total_referral_rewards)} earned</small>` : ''}
        </td>
        <td>
          <small>${user.last_login ? Utils.formatRelativeTime(user.last_login) : 'Never'}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-primary btn-sm" onclick="window.users.viewUser('${user.id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick="window.users.editUser('${user.id}')" title="Edit User">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-${user.subscription_status === 'suspended' ? 'success' : 'warning'} btn-sm" onclick="window.users.toggleUserStatus('${user.id}', ${user.subscription_status === 'suspended'})" title="${user.subscription_status === 'suspended' ? 'Unsuspend' : 'Suspend'} User">
              <i class="fas fa-${user.subscription_status === 'suspended' ? 'user-check' : 'user-times'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
  }

  // Render pagination
  renderPagination(currentPage, totalPages) {
    const pagination = document.getElementById('usersPagination');
    const paginationInfo = document.getElementById('usersPaginationInfo');
    
    // Update info
    const info = Utils.getPaginationInfo(currentPage, totalPages, this.totalUsers, this.pageSize);
    paginationInfo.textContent = info.showingText;

    // Generate pagination
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="window.users.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left"></i>
        </button>
      </li>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      paginationHtml += `<li class="page-item"><button class="page-link" onclick="window.users.goToPage(1)">1</button></li>`;
      if (startPage > 2) {
        paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <button class="page-link" onclick="window.users.goToPage(${i})">${i}</button>
        </li>
      `;
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      paginationHtml += `<li class="page-item"><button class="page-link" onclick="window.users.goToPage(${totalPages})">${totalPages}</button></li>`;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="window.users.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    `;

    pagination.innerHTML = paginationHtml;
  }

  // Go to specific page
  goToPage(page) {
    this.currentPage = page;
    this.loadUsers();
  }

  // View user details
  async viewUser(userId) {
    try {
      Utils.showLoading();
      const userDetails = await api.getUser(userId);
      
      const detailsHtml = `
        <div class="row">
          <div class="col-md-6">
            <h6>Basic Information</h6>
            <table class="table table-sm">
              <tr><td><strong>Email:</strong></td><td>${Utils.escapeHtml(userDetails.user.email || '')}</td></tr>
              <tr><td><strong>Display Name:</strong></td><td>${Utils.escapeHtml(userDetails.user.display_name || '')}</td></tr>
              <tr><td><strong>Current Tier:</strong></td><td><span class="badge ${Utils.getStatusBadgeClass(userDetails.user.current_tier)}">${(userDetails.user.current_tier || 'free').toUpperCase()}</span></td></tr>
              <tr><td><strong>Status:</strong></td><td><span class="badge ${Utils.getStatusBadgeClass(userDetails.user.subscription_status)}">${(userDetails.user.subscription_status || 'active').toUpperCase()}</span></td></tr>
              <tr><td><strong>Joined:</strong></td><td>${Utils.formatDate(userDetails.user.created_at)}</td></tr>
              <tr><td><strong>Last Login:</strong></td><td>${userDetails.user.last_login ? Utils.formatDate(userDetails.user.last_login) : 'Never'}</td></tr>
            </table>
          </div>
          <div class="col-md-6">
            <h6>Subscription & Referrals</h6>
            <table class="table table-sm">
              <tr><td><strong>Subscription Period:</strong></td><td>${userDetails.user.subscription_period || 'N/A'}</td></tr>
              <tr><td><strong>Total Referrals:</strong></td><td>${userDetails.user.total_referrals || 0}</td></tr>
              <tr><td><strong>Referral Rewards:</strong></td><td>${Utils.formatCurrency(userDetails.user.total_referral_rewards || 0)}</td></tr>
              <tr><td><strong>Referral Code:</strong></td><td><code>${userDetails.user.referral_code || 'N/A'}</code></td></tr>
            </table>
          </div>
        </div>
        
        ${userDetails.transactions && userDetails.transactions.length > 0 ? `
        <h6>Recent Transactions</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${userDetails.transactions.slice(0, 5).map(transaction => `
                <tr>
                  <td>${Utils.formatDate(transaction.created_at)}</td>
                  <td>${Utils.formatCurrency(transaction.amount)}</td>
                  <td>${transaction.tier || 'N/A'}</td>
                  <td><span class="badge ${Utils.getStatusBadgeClass(transaction.status)}">${transaction.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      `;

      document.getElementById('userDetailsContent').innerHTML = detailsHtml;
      new bootstrap.Modal(document.getElementById('userDetailsModal')).show();
      
    } catch (error) {
      console.error('Error loading user details:', error);
      Utils.showToast('Failed to load user details', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Edit user
  editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = userId;
    document.getElementById('editDisplayName').value = user.display_name || '';
    document.getElementById('editCurrentTier').value = user.current_tier || 'free';
    document.getElementById('editSubscriptionStatus').value = user.subscription_status || 'active';

    new bootstrap.Modal(document.getElementById('userEditModal')).show();
  }

  // Save user changes
  async saveUserChanges() {
    try {
      Utils.showLoading();
      
      const userId = document.getElementById('editUserId').value;
      const updateData = {
        display_name: document.getElementById('editDisplayName').value,
        current_tier: document.getElementById('editCurrentTier').value,
        subscription_status: document.getElementById('editSubscriptionStatus').value
      };

      await api.updateUser(userId, updateData);
      
      bootstrap.Modal.getInstance(document.getElementById('userEditModal')).hide();
      Utils.showToast('User updated successfully', 'success');
      
      await this.loadUsers();
      
    } catch (error) {
      console.error('Error updating user:', error);
      Utils.showToast('Failed to update user', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Toggle user status (suspend/unsuspend)
  async toggleUserStatus(userId, unsuspend = false) {
    const action = unsuspend ? 'unsuspend' : 'suspend';
    const confirmMessage = `Are you sure you want to ${action} this user?`;
    
    if (!(await Utils.confirm(confirmMessage))) {
      return;
    }

    try {
      Utils.showLoading();
      
      await api.suspendUser(userId, !unsuspend, `User ${action}ed by admin`);
      
      Utils.showToast(`User ${action}ed successfully`, 'success');
      await this.loadUsers();
      
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      Utils.showToast(`Failed to ${action} user`, 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Export users
  exportUsers() {
    if (this.users.length === 0) {
      Utils.showToast('No users to export', 'warning');
      return;
    }

    const exportData = this.users.map(user => ({
      'Email': user.email,
      'Display Name': user.display_name,
      'Current Tier': user.current_tier,
      'Subscription Status': user.subscription_status,
      'Total Referrals': user.total_referrals,
      'Referral Rewards': user.total_referral_rewards,
      'Created At': user.created_at,
      'Last Login': user.last_login
    }));

    Utils.downloadCSV(exportData, `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  }
}

// Initialize users management
window.users = new Users();
