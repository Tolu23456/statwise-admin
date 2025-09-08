// Prediction content management functionality

class Predictions {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 20;
    this.filters = {
      minAccuracy: '',
      minConfidence: '',
      startDate: '',
      endDate: ''
    };
    this.charts = {};
  }

  // Render predictions page
  async render() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Predictions Management</h1>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="refreshPredictions">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
            <button class="btn btn-primary btn-sm" id="exportPredictions">
              <i class="fas fa-download me-2"></i>Export
            </button>
          </div>
        </div>

        <!-- Prediction Overview -->
        <div class="row mb-4" id="predictionOverview">
          <!-- Overview stats will be loaded here -->
        </div>

        <!-- Analytics Charts -->
        <div class="row mb-4">
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-chart-line me-2"></i>Accuracy Trends
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
                  <canvas id="accuracyTrendsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>Accuracy by Confidence
                </h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <canvas id="confidenceAccuracyChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Predictions Table -->
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="card-title mb-0">
                  <i class="fas fa-football-ball me-2"></i>Prediction Results
                </h5>
              </div>
              <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                  <input type="number" class="form-control form-control-sm" placeholder="Min Accuracy %" id="minAccuracyFilter" style="max-width: 130px;" min="0" max="100">
                  <input type="number" class="form-control form-control-sm" placeholder="Min Confidence %" id="minConfidenceFilter" style="max-width: 130px;" min="0" max="100">
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
                    <th>Match ID</th>
                    <th>Prediction</th>
                    <th>Actual Result</th>
                    <th>Confidence</th>
                    <th>Accuracy</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="predictionsTableBody">
                  <!-- Predictions will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <div id="predictionsPaginationInfo" class="text-muted small">
                <!-- Pagination info will be shown here -->
              </div>
              <nav>
                <ul class="pagination pagination-sm mb-0" id="predictionsPagination">
                  <!-- Pagination will be loaded here -->
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Prediction Details Modal -->
      <div class="modal fade" id="predictionDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-football-ball me-2"></i>Prediction Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="predictionDetailsContent">
              <!-- Prediction details will be loaded here -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Prediction Modal -->
      <div class="modal fade" id="updatePredictionModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-edit me-2"></i>Update Prediction Result
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="updatePredictionForm">
              <div class="modal-body">
                <input type="hidden" id="updatePredictionId">
                <div class="mb-3">
                  <label for="actualResult" class="form-label">Actual Result</label>
                  <input type="text" class="form-control" id="actualResult" required placeholder="e.g., 2-1, Draw, etc.">
                </div>
                <div class="mb-3">
                  <label for="accuracyScore" class="form-label">Accuracy Score (%)</label>
                  <input type="number" class="form-control" id="accuracyScore" min="0" max="100" step="0.1" required>
                  <div class="form-text">Enter the accuracy percentage (0-100)</div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Result</button>
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
    document.getElementById('refreshPredictions').addEventListener('click', () => {
      this.loadData();
    });

    // Export button
    document.getElementById('exportPredictions').addEventListener('click', () => {
      this.exportPredictions();
    });

    // Filters
    document.getElementById('minAccuracyFilter').addEventListener('change', (e) => {
      this.filters.minAccuracy = e.target.value;
      this.currentPage = 1;
      this.loadPredictions();
    });

    document.getElementById('minConfidenceFilter').addEventListener('change', (e) => {
      this.filters.minConfidence = e.target.value;
      this.currentPage = 1;
      this.loadPredictions();
    });

    document.getElementById('startDateFilter').addEventListener('change', (e) => {
      this.filters.startDate = e.target.value;
      this.currentPage = 1;
      this.loadPredictions();
    });

    document.getElementById('endDateFilter').addEventListener('change', (e) => {
      this.filters.endDate = e.target.value;
      this.currentPage = 1;
      this.loadPredictions();
    });

    // Period selector for charts
    document.querySelectorAll('[data-period]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const period = e.target.getAttribute('data-period');
        this.loadPredictionAnalytics(period);
      });
    });

    // Update prediction form
    document.getElementById('updatePredictionForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updatePredictionResult();
    });
  }

  // Load all data
  async loadData() {
    try {
      await Promise.all([
        this.loadPredictionOverview(),
        this.loadPredictionAnalytics(),
        this.loadPredictions()
      ]);
    } catch (error) {
      console.error('Error loading prediction data:', error);
      Utils.showToast('Failed to load prediction data', 'danger');
    }
  }

  // Load prediction overview
  async loadPredictionOverview() {
    try {
      const overview = await api.getPredictionOverview();
      
      const overviewHtml = `
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-football-ball"></i>
            </div>
            <div class="stat-value">${Utils.formatNumber(overview.totalPredictions || 0)}</div>
            <div class="stat-label">Total Predictions</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              ${Utils.formatNumber(overview.monthlyPredictions || 0)} this month
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-target"></i>
            </div>
            <div class="stat-value">${Utils.formatPercentage(overview.averageAccuracy || 0)}</div>
            <div class="stat-label">Average Accuracy</div>
            <div class="stat-change">
              <i class="fas fa-chart-line"></i>
              Overall performance
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-value">${Utils.formatPercentage(overview.averageConfidence || 0)}</div>
            <div class="stat-label">Average Confidence</div>
            <div class="stat-change">
              <i class="fas fa-brain"></i>
              AI confidence
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-value">${Object.keys(overview.accuracyByConfidence || {}).length}</div>
            <div class="stat-label">Confidence Levels</div>
            <div class="stat-change">
              <i class="fas fa-layer-group"></i>
              Categories tracked
            </div>
          </div>
        </div>
      `;

      document.getElementById('predictionOverview').innerHTML = overviewHtml;
      
      // Load confidence accuracy chart data
      this.loadConfidenceAccuracyChart(overview.accuracyByConfidence || {});
      
    } catch (error) {
      console.error('Error loading prediction overview:', error);
    }
  }

  // Load confidence accuracy chart
  loadConfidenceAccuracyChart(accuracyByConfidence) {
    // Destroy existing chart
    if (this.charts.confidenceAccuracy) {
      this.charts.confidenceAccuracy.destroy();
    }

    const ctx = document.getElementById('confidenceAccuracyChart').getContext('2d');
    const labels = Object.keys(accuracyByConfidence);
    const data = Object.values(accuracyByConfidence);
    const colors = ['#dc3545', '#ffc107', '#28a745']; // Red, Yellow, Green

    this.charts.confidenceAccuracy = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1) + ' Confidence'),
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const accuracy = context.parsed;
                return `${context.label}: ${Utils.formatPercentage(accuracy)} accuracy`;
              }
            }
          }
        }
      }
    });
  }

  // Load prediction analytics
  async loadPredictionAnalytics(period = '30d') {
    try {
      const data = await api.getPredictionAnalytics(period);
      
      // Destroy existing chart
      if (this.charts.accuracyTrends) {
        this.charts.accuracyTrends.destroy();
      }

      const ctx = document.getElementById('accuracyTrendsChart').getContext('2d');
      const dates = Object.keys(data.dailyAverageAccuracy || {}).sort();
      const accuracies = dates.map(date => data.dailyAverageAccuracy[date] || 0);
      const counts = dates.map(date => data.dailyCount[date] || 0);

      this.charts.accuracyTrends = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates.map(date => Utils.formatDate(date, { month: 'short', day: 'numeric' })),
          datasets: [
            {
              label: 'Average Accuracy (%)',
              data: accuracies,
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              yAxisID: 'y'
            },
            {
              label: 'Predictions Count',
              data: counts,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
                text: 'Accuracy (%)'
              },
              min: 0,
              max: 100
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Count'
              },
              grid: {
                drawOnChartArea: false,
              },
              min: 0
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
      console.error('Error loading prediction analytics:', error);
    }
  }

  // Load predictions
  async loadPredictions() {
    try {
      Utils.showLoading();
      
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.filters
      };

      const response = await api.getPredictionResults(params);
      this.predictions = response.predictions || [];

      this.renderPredictionsTable();
      this.renderPredictionsPagination(response.page, response.totalPages, response.total);
      
    } catch (error) {
      console.error('Error loading predictions:', error);
      Utils.showToast('Failed to load predictions', 'danger');
      this.renderPredictionsTable([]);
    } finally {
      Utils.hideLoading();
    }
  }

  // Render predictions table
  renderPredictionsTable() {
    const tbody = document.getElementById('predictionsTableBody');
    
    if (this.predictions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-football-ball"></i>
              <p>No predictions found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const rows = this.predictions.map(prediction => `
      <tr>
        <td>
          <code class="small">${prediction.match_id || 'N/A'}</code>
        </td>
        <td>
          <div class="fw-semibold">${Utils.escapeHtml(prediction.prediction || 'N/A')}</div>
        </td>
        <td>
          <div class="fw-semibold ${prediction.actual_result ? 'text-success' : 'text-muted'}">
            ${Utils.escapeHtml(prediction.actual_result || 'Pending')}
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div class="progress me-2" style="width: 60px; height: 6px;">
              <div class="progress-bar" role="progressbar" style="width: ${prediction.confidence || 0}%" 
                   aria-valuenow="${prediction.confidence || 0}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small class="fw-semibold">${Utils.formatPercentage(prediction.confidence || 0, 0)}</small>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            ${prediction.accuracy !== null && prediction.accuracy !== undefined ? `
              <div class="progress me-2" style="width: 60px; height: 6px;">
                <div class="progress-bar ${prediction.accuracy >= 70 ? 'bg-success' : prediction.accuracy >= 50 ? 'bg-warning' : 'bg-danger'}" 
                     role="progressbar" style="width: ${prediction.accuracy}%" 
                     aria-valuenow="${prediction.accuracy}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <small class="fw-semibold">${Utils.formatPercentage(prediction.accuracy, 0)}</small>
            ` : '<span class="text-muted small">N/A</span>'}
          </div>
        </td>
        <td>
          <div>${Utils.formatDate(prediction.created_at)}</div>
          <small class="text-muted">${Utils.formatRelativeTime(prediction.created_at)}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-primary btn-sm" onclick="window.predictions.viewPrediction('${prediction.id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick="window.predictions.updatePrediction('${prediction.id}')" title="Update Result">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
  }

  // Render predictions pagination
  renderPredictionsPagination(currentPage, totalPages, totalItems) {
    const pagination = document.getElementById('predictionsPagination');
    const paginationInfo = document.getElementById('predictionsPaginationInfo');
    
    // Update info
    const info = Utils.getPaginationInfo(currentPage, totalPages, totalItems, this.pageSize);
    paginationInfo.textContent = info.showingText;

    // Generate pagination
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="window.predictions.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
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
          <button class="page-link" onclick="window.predictions.goToPage(${i})">${i}</button>
        </li>
      `;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="window.predictions.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    `;

    pagination.innerHTML = paginationHtml;
  }

  // Go to specific page
  goToPage(page) {
    this.currentPage = page;
    this.loadPredictions();
  }

  // View prediction details
  viewPrediction(predictionId) {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) return;

    const detailsHtml = `
      <div class="row">
        <div class="col-md-6">
          <h6>Prediction Information</h6>
          <table class="table table-sm">
            <tr><td><strong>Match ID:</strong></td><td><code>${prediction.match_id || 'N/A'}</code></td></tr>
            <tr><td><strong>Prediction:</strong></td><td>${Utils.escapeHtml(prediction.prediction || 'N/A')}</td></tr>
            <tr><td><strong>Confidence:</strong></td><td>
              <div class="d-flex align-items-center">
                <div class="progress me-2" style="width: 100px; height: 8px;">
                  <div class="progress-bar" role="progressbar" style="width: ${prediction.confidence || 0}%"></div>
                </div>
                ${Utils.formatPercentage(prediction.confidence || 0)}
              </div>
            </td></tr>
            <tr><td><strong>Created:</strong></td><td>${Utils.formatDate(prediction.created_at)}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6>Result Information</h6>
          <table class="table table-sm">
            <tr><td><strong>Actual Result:</strong></td><td>${Utils.escapeHtml(prediction.actual_result || 'Pending')}</td></tr>
            <tr><td><strong>Accuracy:</strong></td><td>
              ${prediction.accuracy !== null && prediction.accuracy !== undefined ? `
                <div class="d-flex align-items-center">
                  <div class="progress me-2" style="width: 100px; height: 8px;">
                    <div class="progress-bar ${prediction.accuracy >= 70 ? 'bg-success' : prediction.accuracy >= 50 ? 'bg-warning' : 'bg-danger'}" 
                         role="progressbar" style="width: ${prediction.accuracy}%"></div>
                  </div>
                  ${Utils.formatPercentage(prediction.accuracy)}
                </div>
              ` : '<span class="text-muted">Not available</span>'}
            </td></tr>
            <tr><td><strong>Status:</strong></td><td>
              <span class="badge ${prediction.actual_result ? 'bg-success' : 'bg-warning'}">
                ${prediction.actual_result ? 'Completed' : 'Pending'}
              </span>
            </td></tr>
          </table>
        </div>
      </div>
    `;

    document.getElementById('predictionDetailsContent').innerHTML = detailsHtml;
    new bootstrap.Modal(document.getElementById('predictionDetailsModal')).show();
  }

  // Update prediction result
  updatePrediction(predictionId) {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) return;

    document.getElementById('updatePredictionId').value = predictionId;
    document.getElementById('actualResult').value = prediction.actual_result || '';
    document.getElementById('accuracyScore').value = prediction.accuracy || '';

    new bootstrap.Modal(document.getElementById('updatePredictionModal')).show();
  }

  // Update prediction result
  async updatePredictionResult() {
    try {
      Utils.showLoading();
      
      const predictionId = document.getElementById('updatePredictionId').value;
      const actualResult = document.getElementById('actualResult').value;
      const accuracy = parseFloat(document.getElementById('accuracyScore').value);

      await api.updatePredictionResult(predictionId, actualResult, accuracy);
      
      bootstrap.Modal.getInstance(document.getElementById('updatePredictionModal')).hide();
      Utils.showToast('Prediction result updated successfully', 'success');
      
      await this.loadPredictions();
      await this.loadPredictionOverview();
      
    } catch (error) {
      console.error('Error updating prediction result:', error);
      Utils.showToast('Failed to update prediction result', 'danger');
    } finally {
      Utils.hideLoading();
    }
  }

  // Export predictions
  exportPredictions() {
    if (this.predictions.length === 0) {
      Utils.showToast('No predictions to export', 'warning');
      return;
    }

    const exportData = this.predictions.map(prediction => ({
      'Match ID': prediction.match_id,
      'Prediction': prediction.prediction,
      'Actual Result': prediction.actual_result,
      'Confidence': prediction.confidence,
      'Accuracy': prediction.accuracy,
      'Created At': prediction.created_at
    }));

    Utils.downloadCSV(exportData, `predictions_export_${new Date().toISOString().split('T')[0]}.csv`);
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

// Initialize predictions management
window.predictions = new Predictions();
