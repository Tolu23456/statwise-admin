// Dashboard page functionality

class Dashboard {
  constructor() {
    this.charts = {};
    this.refreshInterval = null;
  }

  // Render dashboard page
  async render() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Dashboard Overview</h1>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="refreshDashboard">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
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

        <!-- Key Metrics -->
        <div class="row mb-4" id="keyMetrics">
          <!-- Metrics will be loaded here -->
        </div>

        <!-- Charts Row -->
        <div class="row mb-4">
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-line me-2"></i>Revenue Trends
                </h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <canvas id="revenueChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-pie-chart me-2"></i>Subscription Tiers
                </h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <canvas id="subscriptionChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Tables -->
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-users me-2"></i>Recent User Activity
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0" id="recentUsersTable">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Data will be loaded here -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-money-bill-wave me-2"></i>Recent Transactions
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0" id="recentTransactionsTable">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Data will be loaded here -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
    await this.loadDashboardData();
    this.startAutoRefresh();
  }

  // Setup event handlers
  setupEventHandlers() {
    // Refresh button
    document.getElementById('refreshDashboard').addEventListener('click', () => {
      this.loadDashboardData();
    });

    // Period selector
    document.querySelectorAll('[data-period]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const period = e.target.getAttribute('data-period');
        this.loadDashboardData(period);
      });
    });
  }

  // Load dashboard data
  async loadDashboardData(period = '30d') {
    try {
      await Promise.all([
        this.loadKeyMetrics(),
        this.loadRevenueChart(period),
        this.loadSubscriptionChart(),
        this.loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Utils.showToast('Failed to load dashboard data', 'danger');
    }
  }

  // Load key metrics
  async loadKeyMetrics() {
    try {
      const [userStats, subscriptionStats, referralStats] = await Promise.all([
        api.getUserStats(),
        api.getSubscriptionOverview(),
        api.getReferralOverview()
      ]);

      const metricsHtml = `
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(userStats.totalUsers || 0)}</div>
            <div class="stat-label">Total Users</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              ${Utils.formatNumber(userStats.newUsersThisMonth || 0)} this month
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-value">${Utils.formatCurrency(subscriptionStats.totalRevenue || 0)}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              ${Utils.formatCurrency(subscriptionStats.monthlyRevenue || 0)} this month
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-credit-card"></i>
            </div>
            <div class="stat-value">${Utils.formatPercentage(subscriptionStats.successRate || 0)}</div>
            <div class="stat-label">Payment Success Rate</div>
            <div class="stat-change">
              <i class="fas fa-chart-line"></i>
              ${Utils.formatNumber(subscriptionStats.successfulTransactions || 0)} successful
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-share-alt"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(referralStats.totalReferrals || 0)}</div>
            <div class="stat-label">Total Referrals</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              ${Utils.formatNumber(referralStats.monthlyReferrals || 0)} this month
            </div>
          </div>
        </div>
      `;

      document.getElementById('keyMetrics').innerHTML = metricsHtml;
    } catch (error) {
      console.error('Error loading key metrics:', error);
    }
  }

  // Load revenue chart
  async loadRevenueChart(period = '30d') {
    try {
      const data = await api.getRevenueAnalytics(period);
      
      // Destroy existing chart
      if (this.charts.revenue) {
        this.charts.revenue.destroy();
      }

      const ctx = document.getElementById('revenueChart').getContext('2d');
      const dates = Object.keys(data.dailyRevenue || {}).sort();
      const revenues = dates.map(date => data.dailyRevenue[date] || 0);

      this.charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates.map(date => Utils.formatDate(date, { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Daily Revenue',
            data: revenues,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
          },
          elements: {
            point: {
              radius: 3,
              hoverRadius: 6
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading revenue chart:', error);
    }
  }

  // Load subscription chart
  async loadSubscriptionChart() {
    try {
      const userStats = await api.getUserStats();
      const tierDistribution = userStats.tierDistribution || {};
      
      // Destroy existing chart
      if (this.charts.subscription) {
        this.charts.subscription.destroy();
      }

      const ctx = document.getElementById('subscriptionChart').getContext('2d');
      const labels = Object.keys(tierDistribution);
      const data = Object.values(tierDistribution);
      const colors = Utils.getChartColors(labels.length);

      this.charts.subscription = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
          datasets: [{
            data: data,
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
      console.error('Error loading subscription chart:', error);
    }
  }

  // Load recent activity
  async loadRecentActivity() {
    try {
      // Load recent users (simulated for now)
      const recentUsersHtml = `
        <tr>
          <td colspan="3" class="text-center text-muted py-3">
            <i class="fas fa-info-circle me-2"></i>
            Recent user activity will be displayed here
          </td>
        </tr>
      `;
      document.querySelector('#recentUsersTable tbody').innerHTML = recentUsersHtml;

      // Load recent transactions
      const transactions = await api.getTransactions({ limit: 5 });
      
      if (transactions.transactions && transactions.transactions.length > 0) {
        const transactionsHtml = transactions.transactions.map(transaction => `
          <tr>
            <td>
              <div class="d-flex align-items-center">
                <div>
                  <div class="fw-semibold">${Utils.escapeHtml(transaction.user_profiles?.display_name || 'Unknown')}</div>
                  <small class="text-muted">${Utils.escapeHtml(transaction.user_profiles?.email || '')}</small>
                </div>
              </div>
            </td>
            <td>
              <span class="fw-semibold">${Utils.formatCurrency(transaction.amount)}</span>
              <br>
              <small class="text-muted">${transaction.tier || 'N/A'}</small>
            </td>
            <td>
              <span class="badge ${Utils.getStatusBadgeClass(transaction.status)}">${transaction.status}</span>
            </td>
            <td>
              <small>${Utils.formatRelativeTime(transaction.created_at)}</small>
            </td>
          </tr>
        `).join('');
        
        document.querySelector('#recentTransactionsTable tbody').innerHTML = transactionsHtml;
      } else {
        document.querySelector('#recentTransactionsTable tbody').innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted py-3">
              <i class="fas fa-info-circle me-2"></i>
              No recent transactions found
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  // Start auto refresh
  startAutoRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);
  }

  // Clear charts
  clearCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
    
    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// Initialize dashboard
window.dashboard = new Dashboard();
