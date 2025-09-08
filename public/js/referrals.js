// Referral system management functionality

class Referrals {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 20;
    this.filters = {
      status: '',
      search: ''
    };
    this.charts = {};
  }

  // Render referrals page
  async render() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Referral System</h1>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="refreshReferrals">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
            <button class="btn btn-primary btn-sm" id="exportReferrals">
              <i class="fas fa-download me-2"></i>Export
            </button>
          </div>
        </div>

        <!-- Referral Overview -->
        <div class="row mb-4" id="referralOverview">
          <!-- Overview stats will be loaded here -->
        </div>

        <!-- Analytics Charts -->
        <div class="row mb-4">
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-chart-line me-2"></i>Referral Trends
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
                  <canvas id="referralTrendsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-trophy me-2"></i>Top Referrers
                </h5>
              </div>
              <div class="card-body">
                <div id="topReferrersContent">
                  <!-- Top referrers will be loaded here -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Referrals Table -->
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="card-title mb-0">
                  <i class="fas fa-share-alt me-2"></i>All Referrals
                </h5>
              </div>
              <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-md-end">
                  <input type="search" class="form-control form-control-sm" placeholder="Search referrals..." id="referralSearch" style="max-width: 200px;">
                  <select class="form-select form-select-sm" id="statusFilter" style="max-width: 150px;">
                    <option value="">All Status</option>
                    <option value="claimed">Claimed</option>
                    <option value="unclaimed">Unclaimed</option>
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
                    <th>Referrer</th>
                    <th>Referred User</th>
                    <th>Referral Code</th>
                    <th>Reward Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="referralsTableBody">
                  <!-- Referrals will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <div id="referralsPaginationInfo" class="text-muted small">
                <!-- Pagination info will be shown here -->
              </div>
              <nav>
                <ul class="pagination pagination-sm mb-0" id="referralsPagination">
                  <!-- Pagination will be loaded here -->
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Referral Details Modal -->
      <div class="modal fade" id="referralDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-share-alt me-2"></i>Referral Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="referralDetailsContent">
              <!-- Referral details will be loaded here -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reward Management Modal -->
      <div class="modal fade" id="rewardManagementModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-gift me-2"></i>Manage Reward
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="rewardManagementForm">
              <div class="modal-body">
                <input type="hidden" id="rewardReferralId">
                <div class="mb-3">
                  <label for="rewardAmount" class="form-label">Reward Amount</label>
                  <input type="number" class="form-control" id="rewardAmount" step="0.01" min="0" required>
                </div>
                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="rewardClaimed">
                    <label class="form-check-label" for="rewardClaimed">
                      Mark as claimed
                    </label>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Reward</button>
              </div>
            </form>
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
    document.getElementById('refreshReferrals').addEventListener('click', () => {
      this.loadData();
    });

    // Export button
    document.getElementById('exportReferrals').addEventListener('click', () => {
      this.exportReferrals();
    });

    // Search input
    const searchInput = document.getElementById('referralSearch');
    searchInput.addEventListener('input', Utils.debounce(() => {
      this.filters.search = searchInput.value;
      this.currentPage = 1;
      this.loadReferrals();
    }, 300));

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.currentPage = 1;
      this.loadReferrals();
    });

    // Period selector for charts
    document.querySelectorAll('[data-period]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const period = e.target.getAttribute('data-period');
        this.loadReferralAnalytics(period);
      });
    });

    // Reward management form
    document.getElementById('rewardManagementForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateReward();
    });
  }

  // Load all data
  async loadData() {
    try {
      await Promise.all([
        this.loadReferralOverview(),
        this.loadReferralAnalytics(),
        this.loadReferrals()
      ]);
    } catch (error) {
      console.error('Error loading referral data:', error);
      Utils.showToast('Failed to load referral data', 'danger');
    }
  }

  // Load referral overview
  async loadReferralOverview() {
    try {
      const overview = await api.getReferralOverview();
      
      const overviewHtml = `
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-share-alt"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(overview.totalReferrals || 0)}</div>
            <div class="stat-label">Total Referrals</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              ${Utils.formatNumber(overview.monthlyReferrals || 0)} this month
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-value">${Utils.formatCurrency(overview.totalRewards || 0)}</div>
            <div class="stat-label">Total Rewards</div>
            <div class="stat-change">
              <i class="fas fa-gift"></i>
              Distributed
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-value">${Utils.formatPercentage(overview.conversionRate || 0)}</div>
            <div class="stat-label">Conversion Rate</div>
            <div class="stat-change">
              <i class="fas fa-chart-line"></i>
              Referral success
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-crown"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(overview.topReferrers?.length || 0)}</div>
            <div class="stat-label">Active Referrers</div>
            <div class="stat-change">
              <i class="fas fa-users"></i>
              Top performers
            </div>
          </div>
        </div>
      `;

      document.getElementById('referralOverview').innerHTML = overviewHtml;

      // Update top referrers
      this.loadTopReferrers(overview.topReferrers || []);
      
    } catch (error) {
      console.error('Error loading referral overview:', error);
    }
  }

  // Load top referrers
  loadTopReferrers(topReferrers) {
    const content = document.getElementById('topReferrersContent');
    
    if (topReferrers.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-trophy"></i>
          <p>No referrers found</p>
        </div>
      `;
      return;
    }

    const referrersHtml = topReferrers.slice(0, 5).map((referrer, index) => `
      <div class="d-flex align-items-center mb-3">
        <div class="avatar-sm bg-gradient rounded-circle d-flex align-items-center justify-content-center text-white me-3">
          ${index + 1}
        </div>
        <div class="flex-grow-1">
          <div class="fw-semibold">${Utils.escapeHtml(referrer.display_name || referrer.email || 'Unknown')}</div>
          <small class="text-muted">${referrer.total_referrals || 0} referrals • ${Utils.formatCurrency(referrer.total_referral_rewards || 0)}</small>
        </div>
      </div>
    `).join('');

    content.innerHTML = referrersHtml;
  }

  // Load referral analytics
  async loadReferralAnalytics(period = '30d') {
    try {
      const data = await api.getReferralAnalytics(period);
      
      // Destroy existing chart
      if (this.charts.referralTrends) {
        this.charts.referralTrends.destroy();
      }

      const ctx = document.getElementById('referralTrendsChart').getContext('2d');
      const dates = Object.keys(data.dailyReferrals || {}).sort();
      const referrals = dates.map(date => data.dailyReferrals[date] || 0);
      const rewards = dates.map(date => data.dailyRewards[date] || 0);

      this.charts.referralTrends = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates.map(date => Utils.formatDate(date, { month: 'short', day: 'numeric' })),
          datasets: [
            {
              label: 'Daily Referrals',
              data: referrals,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              yAxisID: 'y'
            },
            {
              label: 'Daily Rewards',
              data: rewards,
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Referrals Count'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Rewards ($)'
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function(value) {
                  return Utils.formatCurrency(value);
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            }
          }
        }
      });

    } catch (error) {
      console.error('Error loading referral analytics:', error);
    }
  }

  // Load referrals
  async loadReferrals() {
    try {
      Utils.showLoading();
      
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.filters
      };

      const response = await api.getReferrals(params);
      this.referrals = response.referrals || [];

      this.renderReferralsTable();
      this.renderReferralsPagination(response.page, response.totalPages, response.total);
      
    } catch (error) {
      console.error('Error loading referrals:', error);
      Utils.showToast('Failed to load referrals', 'danger');
      this.renderReferralsTable([]);
    } finally {
      Utils.hideLoading();
    }
  }

  // Render referrals table
  renderReferralsTable() {
    const tbody = document.getElementById('referralsTableBody');
    
    if (this.referrals.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-share-alt"></i>
              <p>No referrals found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = this.referrals.map(referral => `
      <tr>
        <td>
          <div>
            <div class="fw-semibold">${Utils.escapeHtml(referral.referrer?.display_name || referral.referrer?.email || 'Unknown')}</div>
            <small class="text-muted">${Utils.escapeHtml(referral.referrer?.email || '')}</small>
          </div>
        </td>
        <td>
          <div>
            <div class="fw-semibold">${Utils.escapeHtml(referral.referred?.display_name || referral.referred?.email || 'Unknown')}</div>
            <small class="text-muted">${Utils.escapeHtml(referral.referred?.email || '')}</small>
          </div>
        </td>
        <td>
          <code>${referral.referral_code || 'N/A'}</code>
        </td>
        <td>
          <span class="fw-semibold">${Utils.formatCurrency(referral.reward_amount || 0)}</span>
        </td>
        <td>
          <span class="badge ${referral.reward_claimed ? 'bg-success' : 'bg-warning'}">
            ${referral.reward_claimed ? 'CLAIMED' : 'UNCLAIMED'}
          </span>
        </td>
        <td>
          <div>${Utils.formatDate(referral.created_at)}</div>
          <small class="text-muted">${Utils.formatRelativeTime(referral.created_at)}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-primary btn-sm" onclick="window.referrals.viewReferral('${referral.id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick="window.referrals.manageReward('${referral.id}')" title="Manage Reward">
              <i class="fas fa-gift"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
  }

  // Render referrals pagination
  renderReferralsPagination(currentPage, totalPages, totalItems) {
    const pagination = document.getElementById('referralsPagination');
    const paginationInfo = document.getElementById('referralsPaginationInfo');
    
    // Update info
    const info = Utils.getPaginationInfo(currentPage, totalPages, totalItems, this.pageSize);
    paginationInfo.textContent = info.showingText;

    // Generate pagination
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="window.referrals.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
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
          <button class="page-link" onclick="window.referrals.goToPage(${i})">${i}</button>
        </li>
      `;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="window.referrals.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    `;

    pagination.innerHTML = paginationHtml;
  }

  // Go to specific page
  goToPage(page) {
    this.currentPage = page;
    this.loadReferrals();
  }

  // View referral details
  viewReferral(referralId) {
    const referral = this.referrals.find(r => r.id === referralId);
    if (!referral) return;

    const detailsHtml = `
      <div class="row">
        <div class="col-md-6">
          <h6>Referrer Information</h6>
          <table class="table table-sm">
            <tr><td><strong>Name:</strong></td><td>${Utils.escapeHtml(referral.referrer?.display_name || 'Unknown')}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${Utils.escapeHtml(referral.referrer?.email || '')}</td></tr>
            <tr><td><strong>Total Referrals:</strong></td><td>${referral.referrer?.total_referrals || 0}</td></tr>
            <tr><td><strong>Total Rewards:</strong></td><td>${Utils.formatCurrency(referral.referrer?.total_referral_rewards || 0)}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6>Referred User Information</h6>
          <table class="table table-sm">
            <tr><td><strong>Name:</strong></td><td>${Utils.escapeHtml(referral.referred?.display_name || 'Unknown')}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${Utils.escapeHtml(referral.referred?.email || '')}</td></tr>
            <tr><td><strong>Current Tier:</strong></td><td><span class="badge ${Utils.getStatusBadgeClass(referral.referred?.current_tier)}">${(referral.referred?.current_tier || 'free').toUpperCase()}</span></td></tr>
            <tr><td><strong>Joined:</strong></td><td>${referral.referred?.created_at ? Utils.formatDate(referral.referred.created_at) : 'N/A'}</td></tr>
          </table>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h6>Referral Details</h6>
          <table class="table table-sm">
            <tr><td><strong>Referral Code:</strong></td><td><code>${referral.referral_code || 'N/A'}</code></td></tr>
            <tr><td><strong>Reward Amount:</strong></td><td>${Utils.formatCurrency(referral.reward_amount || 0)}</td></tr>
            <tr><td><strong>Reward Status:</strong></td><td><span class="badge ${referral.reward_claimed ? 'bg-success' : 'bg-warning'}">${referral.reward_claimed ? 'CLAIMED' : 'UNCLAIMED'}</span></td></tr>
            <tr><td><strong>Referral Date:</strong></td><td>${Utils.formatDate(referral.created_at)}</td></tr>
          </table>
        </div>
      </div>
    `;

    document.getElementById('referralDetailsContent').innerHTML = detailsHtml;
    new bootstrap.Modal(document.getElementById('referralDetailsModal')).show();
  }

  // Manage referral reward
  manageReward(referralId) {
    const referral = this.referrals.find(r => r.id === referralId);
    if (!referral) return;

    document.getElementById('rewardReferralId').value = referralId;
    document.getElementById('rewardAmount').value = referral.reward_amount || 0;
    document.getElementById('rewardClaimed').checked = referral.reward_claimed || false;

    new bootstrap.Modal(document.getElementById('rewardManagementModal')).show();
  }

  // Update reward
  async updateReward() {
    try {
      Utils.showLoading();
      
      const referralId = document.getElementById('rewardReferralId').value;
      const rewardAmount = parseFloat(document.getElementById('rewardAmount').value);
      const claimed = document.getElementById('rewardClaimed').checked;

      await api.updateReferralReward(referralId, rewardAmount, claimed);
      
      bootstrap.Modal.getInstance(document.getElementById('rewardManagementModal')).hide();
      Utils.showToast('Reward updated successfully', 'success');
      
      await this.loadReferrals();
      await this.loadReferralOverview();
      
    } catch (error) {
      console.error('Error updating reward:', error);
      Utils.showToast('Failed to update reward', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Export referrals
  exportReferrals() {
    if (this.referrals.length === 0) {
      Utils.showToast('No referrals to export', 'warning');
      return;
    }

    const exportData = this.referrals.map(referral => ({
      'Referrer Email': referral.referrer?.email,
      'Referrer Name': referral.referrer?.display_name,
      'Referred Email': referral.referred?.email,
      'Referred Name': referral.referred?.display_name,
      'Referral Code': referral.referral_code,
      'Reward Amount': referral.reward_amount,
      'Reward Claimed': referral.reward_claimed ? 'Yes' : 'No',
      'Created At': referral.created_at
    }));

    Utils.downloadCSV(exportData, `referrals_export_${new Date().toISOString().split('T')[0]}.csv`);
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

// Initialize referrals management
window.referrals = new Referrals();
