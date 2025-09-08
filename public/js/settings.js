// Settings and system administration functionality

class Settings {
  constructor() {
    this.currentTab = 'app-settings';
    this.currentLogPage = 1;
    this.logPageSize = 50;
    this.logFilters = {
      action: '',
      adminId: '',
      startDate: '',
      endDate: ''
    };
  }

  // Render settings page
  async render() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">System Settings</h1>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="refreshSettings">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4" id="settingsTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="app-settings-tab" data-bs-toggle="tab" data-bs-target="#app-settings" 
                    type="button" role="tab" aria-controls="app-settings" aria-selected="true">
              <i class="fas fa-cog me-2"></i>App Settings
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="admin-users-tab" data-bs-toggle="tab" data-bs-target="#admin-users" 
                    type="button" role="tab" aria-controls="admin-users" aria-selected="false">
              <i class="fas fa-user-shield me-2"></i>Admin Users
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="system-logs-tab" data-bs-toggle="tab" data-bs-target="#system-logs" 
                    type="button" role="tab" aria-controls="system-logs" aria-selected="false">
              <i class="fas fa-clipboard-list me-2"></i>System Logs
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="system-info-tab" data-bs-toggle="tab" data-bs-target="#system-info" 
                    type="button" role="tab" aria-controls="system-info" aria-selected="false">
              <i class="fas fa-info-circle me-2"></i>System Info
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="settingsTabContent">
          <!-- App Settings Tab -->
          <div class="tab-pane fade show active" id="app-settings" role="tabpanel" aria-labelledby="app-settings-tab">
            <div class="row">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-sliders-h me-2"></i>Application Settings
                      </h5>
                      <button class="btn btn-primary btn-sm" id="addSettingBtn">
                        <i class="fas fa-plus me-2"></i>Add Setting
                      </button>
                    </div>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Key</th>
                            <th>Value</th>
                            <th>Description</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody id="appSettingsTableBody">
                          <!-- Settings will be loaded here -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-info me-2"></i>Settings Help
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="alert alert-info">
                      <h6><i class="fas fa-lightbulb me-2"></i>Common Settings</h6>
                      <ul class="mb-0 small">
                        <li><strong>app_name:</strong> Application display name</li>
                        <li><strong>maintenance_mode:</strong> Enable/disable maintenance</li>
                        <li><strong>max_predictions_per_day:</strong> Daily prediction limit</li>
                        <li><strong>referral_reward_amount:</strong> Default referral reward</li>
                        <li><strong>premium_price_monthly:</strong> Premium tier monthly price</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Users Tab -->
          <div class="tab-pane fade" id="admin-users" role="tabpanel" aria-labelledby="admin-users-tab">
            <div class="card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-user-shield me-2"></i>Administrator Users
                  </h5>
                  <button class="btn btn-primary btn-sm" id="addAdminBtn">
                    <i class="fas fa-plus me-2"></i>Add Admin
                  </button>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Permissions</th>
                        <th>Last Login</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="adminUsersTableBody">
                      <!-- Admin users will be loaded here -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- System Logs Tab -->
          <div class="tab-pane fade" id="system-logs" role="tabpanel" aria-labelledby="system-logs-tab">
            <div class="card">
              <div class="card-header">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-clipboard-list me-2"></i>System Activity Logs
                    </h5>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                      <select class="form-select form-select-sm" id="logActionFilter" style="max-width: 150px;">
                        <option value="">All Actions</option>
                        <option value="user_updated">User Updated</option>
                        <option value="user_suspended">User Suspended</option>
                        <option value="admin_user_created">Admin Created</option>
                        <option value="referral_reward_updated">Referral Updated</option>
                        <option value="app_setting_updated">Setting Updated</option>
                      </select>
                      <input type="date" class="form-control form-control-sm" id="logStartDateFilter" style="max-width: 150px;">
                      <input type="date" class="form-control form-control-sm" id="logEndDateFilter" style="max-width: 150px;">
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Admin</th>
                        <th>Target User</th>
                        <th>Details</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody id="systemLogsTableBody">
                      <!-- System logs will be loaded here -->
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card-footer">
                <div class="d-flex justify-content-between align-items-center">
                  <div id="logsPaginationInfo" class="text-muted small">
                    <!-- Pagination info will be shown here -->
                  </div>
                  <nav>
                    <ul class="pagination pagination-sm mb-0" id="logsPagination">
                      <!-- Pagination will be loaded here -->
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <!-- System Info Tab -->
          <div class="tab-pane fade" id="system-info" role="tabpanel" aria-labelledby="system-info-tab">
            <div class="row">
              <div class="col-lg-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-server me-2"></i>System Information
                    </h5>
                  </div>
                  <div class="card-body">
                    <table class="table table-sm">
                      <tr><td><strong>Application:</strong></td><td>StatWise Admin Panel</td></tr>
                      <tr><td><strong>Version:</strong></td><td>1.0.0</td></tr>
                      <tr><td><strong>Environment:</strong></td><td><span class="badge bg-success">Production</span></td></tr>
                      <tr><td><strong>Database:</strong></td><td>Supabase PostgreSQL</td></tr>
                      <tr><td><strong>Server Time:</strong></td><td id="serverTime">Loading...</td></tr>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-tools me-2"></i>System Actions
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="d-grid gap-2">
                      <button class="btn btn-outline-primary" id="clearCacheBtn">
                        <i class="fas fa-broom me-2"></i>Clear Cache
                      </button>
                      <button class="btn btn-outline-warning" id="maintenanceModeBtn">
                        <i class="fas fa-wrench me-2"></i>Toggle Maintenance Mode
                      </button>
                      <button class="btn btn-outline-info" id="exportSystemDataBtn">
                        <i class="fas fa-download me-2"></i>Export System Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Setting Modal -->
      <div class="modal fade" id="settingModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-cog me-2"></i><span id="settingModalTitle">Add Setting</span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="settingForm">
              <div class="modal-body">
                <input type="hidden" id="settingKey">
                <div class="mb-3">
                  <label for="settingKeyInput" class="form-label">Key</label>
                  <input type="text" class="form-control" id="settingKeyInput" required>
                  <div class="form-text">Use lowercase with underscores (e.g., max_daily_predictions)</div>
                </div>
                <div class="mb-3">
                  <label for="settingValue" class="form-label">Value</label>
                  <textarea class="form-control" id="settingValue" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                  <label for="settingDescription" class="form-label">Description</label>
                  <input type="text" class="form-control" id="settingDescription" required>
                  <div class="form-text">Brief description of what this setting controls</div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Setting</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add/Edit Admin Modal -->
      <div class="modal fade" id="adminModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user-shield me-2"></i><span id="adminModalTitle">Add Admin User</span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="adminForm">
              <div class="modal-body">
                <input type="hidden" id="adminId">
                <div class="mb-3">
                  <label for="adminEmail" class="form-label">Email</label>
                  <input type="email" class="form-control" id="adminEmail" required>
                </div>
                <div class="mb-3">
                  <label for="adminRole" class="form-label">Role</label>
                  <select class="form-select" id="adminRole" required>
                    <option value="">Select Role</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Permissions</label>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="permUserManagement" value="user_management">
                    <label class="form-check-label" for="permUserManagement">User Management</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="permAdminManagement" value="admin_management">
                    <label class="form-check-label" for="permAdminManagement">Admin Management</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="permSystemManagement" value="system_management">
                    <label class="form-check-label" for="permSystemManagement">System Management</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="permReportAccess" value="report_access">
                    <label class="form-check-label" for="permReportAccess">Report Access</label>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
    await this.loadData();
    this.updateServerTime();
  }

  // Setup event handlers
  setupEventHandlers() {
    // Tab switching
    document.querySelectorAll('#settingsTabs button').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.currentTab = e.target.getAttribute('data-bs-target')?.slice(1) || 'app-settings';
      });
    });

    // Refresh button
    document.getElementById('refreshSettings').addEventListener('click', () => {
      this.loadData();
    });

    // App Settings
    document.getElementById('addSettingBtn').addEventListener('click', () => {
      this.showSettingModal();
    });

    document.getElementById('settingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSetting();
    });

    // Admin Users
    document.getElementById('addAdminBtn').addEventListener('click', () => {
      this.showAdminModal();
    });

    document.getElementById('adminForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveAdmin();
    });

    // System Logs filters
    document.getElementById('logActionFilter').addEventListener('change', (e) => {
      this.logFilters.action = e.target.value;
      this.currentLogPage = 1;
      this.loadSystemLogs();
    });

    document.getElementById('logStartDateFilter').addEventListener('change', (e) => {
      this.logFilters.startDate = e.target.value;
      this.currentLogPage = 1;
      this.loadSystemLogs();
    });

    document.getElementById('logEndDateFilter').addEventListener('change', (e) => {
      this.logFilters.endDate = e.target.value;
      this.currentLogPage = 1;
      this.loadSystemLogs();
    });

    // System Actions
    document.getElementById('clearCacheBtn').addEventListener('click', () => {
      this.clearCache();
    });

    document.getElementById('maintenanceModeBtn').addEventListener('click', () => {
      this.toggleMaintenanceMode();
    });

    document.getElementById('exportSystemDataBtn').addEventListener('click', () => {
      this.exportSystemData();
    });
  }

  // Load all data
  async loadData() {
    try {
      await Promise.all([
        this.loadAppSettings(),
        this.loadAdminUsers(),
        this.loadSystemLogs()
      ]);
    } catch (error) {
      console.error('Error loading settings data:', error);
      Utils.showToast('Failed to load settings data', 'danger');
    }
  }

  // Load app settings
  async loadAppSettings() {
    try {
      const settings = await api.getAppSettings();
      this.renderAppSettings(settings);
    } catch (error) {
      console.error('Error loading app settings:', error);
      this.renderAppSettings([]);
    }
  }

  // Render app settings table
  renderAppSettings(settings) {
    const tbody = document.getElementById('appSettingsTableBody');
    
    if (!settings || settings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-cog"></i>
              <p>No settings configured</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = settings.map(setting => `
      <tr>
        <td>
          <code>${Utils.escapeHtml(setting.key)}</code>
        </td>
        <td>
          <div class="text-truncate" style="max-width: 200px;" title="${Utils.escapeHtml(setting.value)}">
            ${Utils.escapeHtml(setting.value)}
          </div>
        </td>
        <td>
          <small>${Utils.escapeHtml(setting.description || 'No description')}</small>
        </td>
        <td>
          <small>${setting.updated_at ? Utils.formatRelativeTime(setting.updated_at) : 'Never'}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-secondary btn-sm" onclick="window.settings.editSetting('${setting.key}')" title="Edit Setting">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="window.settings.deleteSetting('${setting.key}')" title="Delete Setting">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
    this.appSettings = settings;
  }

  // Show setting modal
  showSettingModal(settingKey = null) {
    const modal = document.getElementById('settingModal');
    const title = document.getElementById('settingModalTitle');
    const form = document.getElementById('settingForm');
    
    form.reset();
    
    if (settingKey) {
      const setting = this.appSettings?.find(s => s.key === settingKey);
      if (setting) {
        title.textContent = 'Edit Setting';
        document.getElementById('settingKey').value = settingKey;
        document.getElementById('settingKeyInput').value = settingKey;
        document.getElementById('settingKeyInput').readOnly = true;
        document.getElementById('settingValue').value = setting.value;
        document.getElementById('settingDescription').value = setting.description || '';
      }
    } else {
      title.textContent = 'Add Setting';
      document.getElementById('settingKeyInput').readOnly = false;
    }

    new bootstrap.Modal(modal).show();
  }

  // Edit setting
  editSetting(settingKey) {
    this.showSettingModal(settingKey);
  }

  // Delete setting
  async deleteSetting(settingKey) {
    if (!(await Utils.confirm(`Are you sure you want to delete the setting "${settingKey}"?`))) {
      return;
    }

    Utils.showToast('Delete functionality not yet implemented', 'info');
  }

  // Save setting
  async saveSetting() {
    try {
      Utils.showLoading();
      
      const key = document.getElementById('settingKeyInput').value;
      const value = document.getElementById('settingValue').value;
      const description = document.getElementById('settingDescription').value;

      await api.updateAppSetting(key, value, description);
      
      bootstrap.Modal.getInstance(document.getElementById('settingModal')).hide();
      Utils.showToast('Setting saved successfully', 'success');
      
      await this.loadAppSettings();
      
    } catch (error) {
      console.error('Error saving setting:', error);
      Utils.showToast('Failed to save setting', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Load admin users
  async loadAdminUsers() {
    try {
      const adminUsers = await api.getAdminUsers();
      this.renderAdminUsers(adminUsers);
    } catch (error) {
      console.error('Error loading admin users:', error);
      this.renderAdminUsers([]);
    }
  }

  // Render admin users table
  renderAdminUsers(adminUsers) {
    const tbody = document.getElementById('adminUsersTableBody');
    
    if (!adminUsers || adminUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-user-shield"></i>
              <p>No admin users found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = adminUsers.map(admin => `
      <tr>
        <td>
          <div>
            <div class="fw-semibold">${Utils.escapeHtml(admin.email)}</div>
          </div>
        </td>
        <td>
          <span class="badge ${this.getRoleBadgeClass(admin.role)}">${(admin.role || 'unknown').toUpperCase()}</span>
        </td>
        <td>
          <div class="d-flex flex-wrap gap-1">
            ${(admin.permissions || []).map(perm => `
              <span class="badge bg-secondary small">${perm.replace('_', ' ')}</span>
            `).join('')}
          </div>
        </td>
        <td>
          <small>${admin.last_login ? Utils.formatRelativeTime(admin.last_login) : 'Never'}</small>
        </td>
        <td>
          <small>${Utils.formatDate(admin.created_at)}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-secondary btn-sm" onclick="window.settings.editAdmin('${admin.id}')" title="Edit Admin">
              <i class="fas fa-edit"></i>
            </button>
            ${admin.email !== window.auth?.getCurrentAdmin()?.email ? `
              <button class="btn btn-outline-danger btn-sm" onclick="window.settings.deleteAdmin('${admin.id}')" title="Delete Admin">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
    this.adminUsers = adminUsers;
  }

  // Get role badge class
  getRoleBadgeClass(role) {
    const classes = {
      'super_admin': 'bg-danger',
      'admin': 'bg-primary',
      'manager': 'bg-info',
      'support': 'bg-success'
    };
    return classes[role] || 'bg-secondary';
  }

  // Show admin modal
  showAdminModal(adminId = null) {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const form = document.getElementById('adminForm');
    
    form.reset();
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    if (adminId) {
      const admin = this.adminUsers?.find(a => a.id === adminId);
      if (admin) {
        title.textContent = 'Edit Admin User';
        document.getElementById('adminId').value = adminId;
        document.getElementById('adminEmail').value = admin.email;
        document.getElementById('adminRole').value = admin.role;
        
        // Set permissions
        (admin.permissions || []).forEach(permission => {
          const checkbox = document.querySelector(`input[value="${permission}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    } else {
      title.textContent = 'Add Admin User';
    }

    new bootstrap.Modal(modal).show();
  }

  // Edit admin
  editAdmin(adminId) {
    this.showAdminModal(adminId);
  }

  // Delete admin
  async deleteAdmin(adminId) {
    if (!(await Utils.confirm('Are you sure you want to delete this admin user?'))) {
      return;
    }

    Utils.showToast('Delete functionality not yet implemented', 'info');
  }

  // Save admin
  async saveAdmin() {
    try {
      Utils.showLoading();
      
      const adminId = document.getElementById('adminId').value;
      const email = document.getElementById('adminEmail').value;
      const role = document.getElementById('adminRole').value;
      
      // Get selected permissions
      const permissions = [];
      document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        permissions.push(cb.value);
      });

      const adminData = { email, role, permissions };

      if (adminId) {
        await api.updateAdminUser(adminId, { role, permissions });
      } else {
        await api.createAdminUser(adminData);
      }
      
      bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
      Utils.showToast('Admin user saved successfully', 'success');
      
      await this.loadAdminUsers();
      
    } catch (error) {
      console.error('Error saving admin user:', error);
      Utils.showToast('Failed to save admin user', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Load system logs
  async loadSystemLogs() {
    try {
      Utils.showLoading();
      
      const params = {
        page: this.currentLogPage,
        limit: this.logPageSize,
        ...this.logFilters
      };

      const response = await api.getSystemLogs(params);
      this.systemLogs = response.logs || [];

      this.renderSystemLogs();
      this.renderLogsPagination(response.page, response.totalPages, response.total);
      
    } catch (error) {
      console.error('Error loading system logs:', error);
      Utils.showToast('Failed to load system logs', 'danger');
      this.renderSystemLogs([]);
    } finally {
      Utils.hideLoading();
    }
  }

  // Render system logs table
  renderSystemLogs() {
    const tbody = document.getElementById('systemLogsTableBody');
    
    if (!this.systemLogs || this.systemLogs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-clipboard-list"></i>
              <p>No system logs found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = this.systemLogs.map(log => `
      <tr>
        <td>
          <span class="badge ${this.getActionBadgeClass(log.action)}">${(log.action || 'unknown').replace('_', ' ').toUpperCase()}</span>
        </td>
        <td>
          <div>
            <div class="fw-semibold">${Utils.escapeHtml(log.admin_users?.email || 'System')}</div>
          </div>
        </td>
        <td>
          ${log.target_user_id ? `<code class="small">${log.target_user_id}</code>` : '<span class="text-muted">—</span>'}
        </td>
        <td>
          <div class="text-truncate" style="max-width: 300px;" title="${Utils.escapeHtml(log.details || '')}">
            <small>${Utils.escapeHtml(log.details || 'No details')}</small>
          </div>
        </td>
        <td>
          <div>${Utils.formatDate(log.created_at)}</div>
          <small class="text-muted">${Utils.formatRelativeTime(log.created_at)}</small>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
  }

  // Get action badge class
  getActionBadgeClass(action) {
    const classes = {
      'user_updated': 'bg-info',
      'user_suspended': 'bg-warning',
      'user_unsuspended': 'bg-success',
      'admin_user_created': 'bg-primary',
      'admin_user_updated': 'bg-primary',
      'referral_reward_updated': 'bg-success',
      'prediction_result_updated': 'bg-info',
      'app_setting_updated': 'bg-secondary'
    };
    return classes[action] || 'bg-secondary';
  }

  // Render logs pagination
  renderLogsPagination(currentPage, totalPages, totalItems) {
    const pagination = document.getElementById('logsPagination');
    const paginationInfo = document.getElementById('logsPaginationInfo');
    
    // Update info
    const info = Utils.getPaginationInfo(currentPage, totalPages, totalItems, this.logPageSize);
    paginationInfo.textContent = info.showingText;

    // Generate pagination
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="window.settings.goToLogPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left"></i>
        </button>
      </li>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <button class="page-link" onclick="window.settings.goToLogPage(${i})">${i}</button>
        </li>
      `;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="window.settings.goToLogPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    `;

    pagination.innerHTML = paginationHtml;
  }

  // Go to log page
  goToLogPage(page) {
    this.currentLogPage = page;
    this.loadSystemLogs();
  }

  // Update server time
  updateServerTime() {
    const updateTime = () => {
      const now = new Date();
      const timeElement = document.getElementById('serverTime');
      if (timeElement) {
        timeElement.textContent = now.toLocaleString();
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  // Clear cache
  async clearCache() {
    if (!(await Utils.confirm('Are you sure you want to clear the system cache?'))) {
      return;
    }

    Utils.showToast('Cache clearing functionality not yet implemented', 'info');
  }

  // Toggle maintenance mode
  async toggleMaintenanceMode() {
    if (!(await Utils.confirm('Are you sure you want to toggle maintenance mode?'))) {
      return;
    }

    Utils.showToast('Maintenance mode toggle not yet implemented', 'info');
  }

  // Export system data
  async exportSystemData() {
    if (!(await Utils.confirm('This will export system configuration data. Continue?'))) {
      return;
    }

    try {
      // Export app settings
      if (this.appSettings && this.appSettings.length > 0) {
        Utils.downloadCSV(this.appSettings, `system_settings_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        Utils.showToast('No system data to export', 'warning');
      }
    } catch (error) {
      console.error('Error exporting system data:', error);
      Utils.showToast('Failed to export system data', 'danger');
    }
  }
}

// Initialize settings management
window.settings = new Settings();
