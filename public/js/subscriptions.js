// Subscription and payment management functionality

class Subscriptions {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 20;
    this.filters = {
      status: '',
      tier: '',
      startDate: '',
      endDate: ''
    };
    this.charts = {};
  }

  // Render subscriptions page
  async render() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Subscriptions & Payments</h1>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="refreshSubscriptions">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
            <button class="btn btn-primary btn-sm" id="exportTransactions">
              <i class="fas fa-download me-2"></i>Export
            </button>
          </div>
        </div>

        <!-- Subscription Overview -->
        <div class="row mb-4" id="subscriptionOverview">
          <!-- Overview stats will be loaded here -->
        </div>

        <!-- Revenue Analytics -->
        <div class="row mb-4">
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-chart-area me-2"></i>Revenue Analytics
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <i class="fas fa-calendar me-2"></i>Last 30 days
                    </button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" href="#" data-period="7d">Last 7 days</a></li>
                      <li><a class="dropdown-item" href="#" data-period="30d">Last 30 days</a></li>
                      <li><a class="dropdown-item" href="#" data-period="90d">Last 90 days</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <canvas id="revenueAnalyticsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>Revenue by Tier
                </h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <canvas id="tierRevenueChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="card-title mb-0">
                  <i class="fas fa-credit-card me-2"></i>Payment Transactions
                </h5>
              </div>
              <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                  <select class="form-select form-select-sm" id="statusFilter" style="max-width: 150px;">
                    <option value="">All Status</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select class="form-select form-select-sm" id="tierFilter" style="max-width: 150px;">
                    <option value="">All Tiers</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="vvip">VVIP</option>
                  </select>
                  <input type="date" class="form-control form-control-sm" id="startDateFilter" style="max-width: 150px;">
                  <input type="date" class="form-control form-control-sm" id="endDateFilter" style="max-width: 150px;">
                </div>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Tier</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="transactionsTableBody">
                  <!-- Transactions will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <div id="transactionsPaginationInfo" class="text-muted small">
                <!-- Pagination info will be shown here -->
              </div>
              <nav>
                <ul class="pagination pagination-sm mb-0" id="transactionsPagination">
                  <!-- Pagination will be loaded here -->
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <!-- Subscription Events Tab -->
        <div class="card mt-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-history me-2"></i>Subscription Events
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Event Type</th>
                    <th>Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody id="eventsTableBody">
                  <!-- Events will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Details Modal -->
      <div class="modal fade" id="transactionDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-receipt me-2"></i>Transaction Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="transactionDetailsContent">
              <!-- Transaction details will be loaded here -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
    await this.loadData();
  }

  // Setup event handlers
  setupEventHandlers() {
    // Refresh button
    document.getElementById('refreshSubscriptions').addEventListener('click', () => {
      this.loadData();
    });

    // Export button
    document.getElementById('exportTransactions').addEventListener('click', () => {
      this.exportTransactions();
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.currentPage = 1;
      this.loadTransactions();
    });

    document.getElementById('tierFilter').addEventListener('change', (e) => {
      this.filters.tier = e.target.value;
      this.currentPage = 1;
      this.loadTransactions();
    });

    document.getElementById('startDateFilter').addEventListener('change', (e) => {
      this.filters.startDate = e.target.value;
      this.currentPage = 1;
      this.loadTransactions();
    });

    document.getElementById('endDateFilter').addEventListener('change', (e) => {
      this.filters.endDate = e.target.value;
      this.currentPage = 1;
      this.loadTransactions();
    });

    // Period selector for charts
    document.querySelectorAll('[data-period]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const period = e.target.getAttribute('data-period');
        this.loadRevenueAnalytics(period);
      });
    });
  }

  // Load all data
  async loadData() {
    try {
      await Promise.all([
        this.loadSubscriptionOverview(),
        this.loadRevenueAnalytics(),
        this.loadTransactions(),
        this.loadSubscriptionEvents()
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Utils.showToast('Failed to load subscription data', 'danger');
    }
  }

  // Load subscription overview
  async loadSubscriptionOverview() {
    try {
      const overview = await api.getSubscriptionOverview();
      
      const overviewHtml = `
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-value">${Utils.formatCurrency(overview.totalRevenue || 0)}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              ${Utils.formatCurrency(overview.monthlyRevenue || 0)} this month
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-credit-card"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(overview.totalTransactions || 0)}</div>
            <div class="stat-label">Total Transactions</div>
            <div class="stat-change positive">
              <i class="fas fa-check"></i>
              ${Utils.formatNumber(overview.successfulTransactions || 0)} successful
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-value">${Utils.formatPercentage(overview.successRate || 0)}</div>
            <div class="stat-label">Success Rate</div>
            <div class="stat-change">
              <i class="fas fa-chart-line"></i>
              Payment processing
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(Object.values(overview.subscriptionStats || {}).reduce((sum, count) => sum + count, 0))}</div>
            <div class="stat-label">Active Subscriptions</div>
            <div class="stat-change">
              <i class="fas fa-crown"></i>
              All tiers combined
            </div>
          </div>
        </div>
      `;

      document.getElementById('subscriptionOverview').innerHTML = overviewHtml;
    } catch (error) {
      console.error('Error loading subscription overview:', error);
    }
  }

  // Load revenue analytics
  async loadRevenueAnalytics(period = '30d') {
    try {
      const data = await api.getRevenueAnalytics(period);
      
      // Revenue trend chart
      if (this.charts.revenue) {
        this.charts.revenue.destroy();
      }

      const revenueCtx = document.getElementById('revenueAnalyticsChart').getContext('2d');
      const dates = Object.keys(data.dailyRevenue || {}).sort();
      const revenues = dates.map(date => data.dailyRevenue[date] || 0);

      this.charts.revenue = new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: dates.map(date => Utils.formatDate(date, { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Daily Revenue',
            data: revenues,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return Utils.formatCurrency(value);
                }
              }
            }
          }
        }
      });

      // Tier revenue chart
      if (this.charts.tierRevenue) {
        this.charts.tierRevenue.destroy();
      }

      const tierCtx = document.getElementById('tierRevenueChart').getContext('2d');
      const tierLabels = Object.keys(data.tierRevenue || {});
      const tierData = Object.values(data.tierRevenue || {});
      const colors = Utils.getChartColors(tierLabels.length);

      this.charts.tierRevenue = new Chart(tierCtx, {
        type: 'doughnut',
        data: {
          labels: tierLabels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
          datasets: [{
            data: tierData,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      });

    } catch (error) {
      console.error('Error loading revenue analytics:', error);
    }
  }

  // Load transactions
  async loadTransactions() {
    try {
      Utils.showLoading();
      
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.filters
      };

      const response = await api.getTransactions(params);
      this.transactions = response.transactions || [];

      this.renderTransactionsTable();
      this.renderTransactionsPagination(response.page, response.totalPages, response.total);
      
    } catch (error) {
      console.error('Error loading transactions:', error);
      Utils.showToast('Failed to load transactions', 'danger');
      this.renderTransactionsTable([]);
    } finally {
      Utils.hideLoading();
    }
  }

  // Render transactions table
  renderTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (this.transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-credit-card"></i>
              <p>No transactions found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = this.transactions.map(transaction => `
      <tr>
        <td>
          <code class="small">${transaction.transaction_id || 'N/A'}</code>
        </td>
        <td>
          <div>
            <div class="fw-semibold">${Utils.escapeHtml(transaction.user_profiles?.display_name || 'Unknown')}</div>
            <small class="text-muted">${Utils.escapeHtml(transaction.user_profiles?.email || '')}</small>
          </div>
        </td>
        <td>
          <span class="fw-semibold">${Utils.formatCurrency(transaction.amount)}</span>
          <br>
          <small class="text-muted">${transaction.currency || 'USD'}</small>
        </td>
        <td>
          <span class="badge ${Utils.getStatusBadgeClass(transaction.tier)}">${(transaction.tier || 'N/A').toUpperCase()}</span>
        </td>
        <td>
          <span class="badge ${Utils.getStatusBadgeClass(transaction.status)}">${(transaction.status || 'unknown').toUpperCase()}</span>
        </td>
        <td>
          <div>${Utils.formatDate(transaction.created_at)}</div>
          <small class="text-muted">${Utils.formatRelativeTime(transaction.created_at)}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-primary btn-sm" onclick="window.subscriptions.viewTransaction('${transaction.id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            ${transaction.status === 'failed' ? `
              <button class="btn btn-outline-warning btn-sm" onclick="window.subscriptions.retryTransaction('${transaction.id}')" title="Retry Transaction">
                <i class="fas fa-redo"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
  }

  // Render transactions pagination
  renderTransactionsPagination(currentPage, totalPages, totalItems) {
    const pagination = document.getElementById('transactionsPagination');
    const paginationInfo = document.getElementById('transactionsPaginationInfo');
    
    // Update info
    const info = Utils.getPaginationInfo(currentPage, totalPages, totalItems, this.pageSize);
    paginationInfo.textContent = info.showingText;

    // Generate pagination (similar to users pagination)
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="window.subscriptions.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
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
          <button class="page-link" onclick="window.subscriptions.goToPage(${i})">${i}</button>
        </li>
      `;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="window.subscriptions.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    `;

    pagination.innerHTML = paginationHtml;
  }

  // Load subscription events
  async loadSubscriptionEvents() {
    try {
      const response = await api.getSubscriptionEvents({ limit: 10 });
      const events = response.events || [];
      
      const tbody = document.getElementById('eventsTableBody');
      
      if (events.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4">
              <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No subscription events found</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      const rows = events.map(event => `
        <tr>
          <td>
            <div>
              <div class="fw-semibold">${Utils.escapeHtml(event.user_profiles?.display_name || 'Unknown')}</div>
              <small class="text-muted">${Utils.escapeHtml(event.user_profiles?.email || '')}</small>
            </div>
          </td>
          <td>
            <span class="badge bg-info">${(event.event_type || 'unknown').replace('_', ' ').toUpperCase()}</span>
          </td>
          <td>
            <small>${event.event_data ? JSON.stringify(event.event_data).substring(0, 100) + '...' : 'N/A'}</small>
          </td>
          <td>
            <div>${Utils.formatDate(event.created_at)}</div>
            <small class="text-muted">${Utils.formatRelativeTime(event.created_at)}</small>
          </td>
        </tr>
      `).join('');

      tbody.innerHTML = rows;
      
    } catch (error) {
      console.error('Error loading subscription events:', error);
    }
  }

  // Go to specific page
  goToPage(page) {
    this.currentPage = page;
    this.loadTransactions();
  }

  // View transaction details
  async viewTransaction(transactionId) {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const detailsHtml = `
      <div class="row">
        <div class="col-md-6">
          <h6>Transaction Information</h6>
          <table class="table table-sm">
            <tr><td><strong>Transaction ID:</strong></td><td><code>${transaction.transaction_id || 'N/A'}</code></td></tr>
            <tr><td><strong>Reference:</strong></td><td><code>${transaction.tx_ref || 'N/A'}</code></td></tr>
            <tr><td><strong>Amount:</strong></td><td>${Utils.formatCurrency(transaction.amount)} ${transaction.currency || 'USD'}</td></tr>
            <tr><td><strong>Status:</strong></td><td><span class="badge ${Utils.getStatusBadgeClass(transaction.status)}">${transaction.status}</span></td></tr>
            <tr><td><strong>Payment Type:</strong></td><td>${transaction.payment_type || 'N/A'}</td></tr>
            <tr><td><strong>Created:</strong></td><td>${Utils.formatDate(transaction.created_at)}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6>Subscription Details</h6>
          <table class="table table-sm">
            <tr><td><strong>Tier:</strong></td><td><span class="badge ${Utils.getStatusBadgeClass(transaction.tier)}">${transaction.tier || 'N/A'}</span></td></tr>
            <tr><td><strong>Period:</strong></td><td>${transaction.period || 'N/A'}</td></tr>
            <tr><td><strong>User:</strong></td><td>${Utils.escapeHtml(transaction.user_profiles?.display_name || 'Unknown')}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${Utils.escapeHtml(transaction.user_profiles?.email || '')}</td></tr>
          </table>
        </div>
      </div>
    `;

    document.getElementById('transactionDetailsContent').innerHTML = detailsHtml;
    new bootstrap.Modal(document.getElementById('transactionDetailsModal')).show();
  }

  // Retry failed transaction
  async retryTransaction(transactionId) {
    if (!(await Utils.confirm('Are you sure you want to retry this transaction?'))) {
      return;
    }

    Utils.showToast('Transaction retry functionality not yet implemented', 'info');
  }

  // Export transactions
  exportTransactions() {
    if (this.transactions.length === 0) {
      Utils.showToast('No transactions to export', 'warning');
      return;
    }

    const exportData = this.transactions.map(transaction => ({
      'Transaction ID': transaction.transaction_id,
      'User Email': transaction.user_profiles?.email,
      'User Name': transaction.user_profiles?.display_name,
      'Amount': transaction.amount,
      'Currency': transaction.currency,
      'Tier': transaction.tier,
      'Status': transaction.status,
      'Payment Type': transaction.payment_type,
      'Created At': transaction.created_at
    }));

    Utils.downloadCSV(exportData, `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Clear charts
  clearCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}

// Initialize subscriptions management
window.subscriptions = new Subscriptions();
