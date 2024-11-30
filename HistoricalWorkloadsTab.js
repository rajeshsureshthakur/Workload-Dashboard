import { BaseTab } from './BaseTab.js';

export class HistoricalWorkloadsTab extends BaseTab {
    constructor(dashboardManager) {
        super(dashboardManager, 'historical');
        this.currentFilters = {
            dateRange: '1month',
            scripts: [],
            status: 'all',
            pageSize: 10,
            currentPage: 1
        };
        this.charts = {};
    }

    createTabContent() {
    return `
        <div class="space-y-6">
            <!-- Filters -->
            <div class="tab-section">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Date Range:</label>
                        <select id="dateRangeFilter" class="form-select rounded-md">
                            <option value="1week">Last Week</option>
                            <option value="1month" selected>Last Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Script:</label>
                        <select id="scriptFilter" class="form-select rounded-md" multiple>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Status:</label>
                        <select id="statusFilter" class="form-select rounded-md">
                            <option value="all">All Status</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                            <option value="warning">Warning</option>
                        </select>
                    </div>
                    <button id="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Apply Filters
                    </button>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="tab-section">
                    <h3 class="text-lg font-semibold mb-4">TPH Trend</h3>
                    <canvas id="tphTrendHistoryChart"></canvas>
                </div>
                <div class="tab-section">
                    <h3 class="text-lg font-semibold mb-4">Response Time Trend</h3>
                    <canvas id="rtTrendHistoryChart"></canvas>
                </div>
            </div>

            <!-- Historical Data Table -->
            <div class="tab-section">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Historical Results</h3>
                    <button id="exportHistoricalBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Export Data
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Script</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TPH</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VUsers</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">95th RT</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody id="historicalTableBody">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
                <!-- Pagination -->
                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-700">Rows per page:</span>
                        <select id="rowsPerPage" class="form-select rounded-md">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <div id="paginationControls" class="flex space-x-2">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

        destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }


    async load() {
        try {
            console.log('Loading Historical Workloads tab');
            await this.loadScriptOptions();
            const historicalData = await this.dashboardManager.dataStore.getHistoricalData(this.currentFilters);
            
            // Destroy existing charts before creating new ones
            this.destroyCharts();
            this.initializeCharts();
            
            this.setupEventListeners();
            this.updateContent(historicalData);
        } catch (error) {
            console.error('Error loading historical data:', error);
            this.dashboardManager.showError('Failed to load historical data');
        }
    }

    async loadScriptOptions() {
    try {
        const scripts = await this.dashboardManager.dataStore.getAvailableScripts();
        const select = document.getElementById('scriptFilter');
        if (select) {
            select.innerHTML = scripts.map(script => 
                `<option value="${script.id}">${script.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading script options:', error);
    }
}
    setupEventListeners() {
        // Filter event listeners
        document.getElementById('dateRangeFilter').addEventListener('change', (e) => this.handleDateRangeChange(e));
        document.getElementById('scriptFilter').addEventListener('change', (e) => this.handleScriptFilterChange(e));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.handleStatusFilterChange(e));
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());

        // Date range modal events
        document.getElementById('cancelDateRange').addEventListener('click', () => this.hideDateRangeModal());
        document.getElementById('applyDateRange').addEventListener('click', () => this.applyCustomDateRange());

        // Pagination events
        document.getElementById('rowsPerPage').addEventListener('change', (e) => this.handleRowsPerPageChange(e));

        // Selection and comparison events
        document.getElementById('selectAllTests').addEventListener('change', (e) => this.handleSelectAll(e));
        document.getElementById('compareSelectedBtn').addEventListener('click', () => this.showComparisonAnalysis());
        document.getElementById('closeComparison').addEventListener('click', () => this.hideComparisonModal());

        // Export event
        document.getElementById('exportHistoricalBtn').addEventListener('click', () => this.exportHistoricalData());
    }

    initializeCharts() {
        // TPH Trend Chart
        const tphCtx = document.getElementById('tphTrendHistoryChart')?.getContext('2d');
        if (tphCtx) {
            this.charts.tphTrend = new Chart(tphCtx, this.getTPHTrendConfig());
        }

        // Response Time Trend Chart
        const rtCtx = document.getElementById('rtTrendHistoryChart')?.getContext('2d');
        if (rtCtx) {
            this.charts.rtTrend = new Chart(rtCtx, this.getRTTrendConfig());
        }
    }
    
    initializeComparisonCharts() {
        // TPH Comparison Chart
        this.charts.comparisonTPH = new Chart(
            document.getElementById('comparisonTPHChart').getContext('2d'),
            this.getComparisonChartConfig('TPH Comparison')
        );

        // Response Time Comparison Chart
        this.charts.comparisonRT = new Chart(
            document.getElementById('comparisonRTChart').getContext('2d'),
            this.getComparisonChartConfig('Response Time Comparison')
        );
    }

    updateContent(data) {
        if (!data) {
            console.warn('No historical data provided');
            return;
        }

        try {
            if (data.trends) {
                this.updateTrendCharts(data.trends);
            }
            
            if (Array.isArray(data.results)) {
                this.updateHistoricalTable(data.results);
            }
            
            if (data.pagination) {
                this.updatePagination(data.pagination);
            }
        } catch (error) {
            console.error('Error updating historical content:', error);
        }
    }


    
    updateTrendCharts(trends = {}) {
        try {
            // Update TPH Trend Chart
            if (this.charts.tphTrend && trends.tphData) {
                const tphDatasets = Array.isArray(trends.tphData) ? trends.tphData.map(series => ({
                    label: series.script,
                    data: series.values || [],
                    borderColor: this.getScriptColor(series.script),
                    tension: 0.1
                })) : [];

                this.charts.tphTrend.data.labels = trends.dates || [];
                this.charts.tphTrend.data.datasets = tphDatasets;
                this.charts.tphTrend.update();
            }

            // Update Response Time Trend Chart
            if (this.charts.rtTrend && trends.rtData) {
                const rtDatasets = Array.isArray(trends.rtData) ? trends.rtData.map(series => ({
                    label: series.script,
                    data: series.values || [],
                    borderColor: this.getScriptColor(series.script),
                    tension: 0.1
                })) : [];

                this.charts.rtTrend.data.labels = trends.dates || [];
                this.charts.rtTrend.data.datasets = rtDatasets;
                this.charts.rtTrend.update();
            }
        } catch (error) {
            console.error('Error updating trend charts:', error);
        }
    }
    
    updateHistoricalTable(results) {
        const tbody = document.getElementById('historicalDataBody');
        tbody.innerHTML = '';

        results.forEach(result => {
            const row = this.createHistoricalTableRow(result);
            tbody.appendChild(row);
        });

        this.updateCompareButtonState();
    }

    formatDateTime(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString || 'N/A';
        }
    }

    formatNumber(number) {
        try {
            return new Intl.NumberFormat().format(number);
        } catch (error) {
            return number || 0;
        }
    }

    createHistoricalTableRow(result) {
        try {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="test-select rounded" data-test-id="${result.id || ''}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${this.formatDateTime(result.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${result.scriptName || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${this.formatNumber(result.tph || 0)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${result.vusers || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap">${(result.responseTime95th || 0).toFixed(2)}s</td>
                <td class="px-6 py-4 whitespace-nowrap">${(result.successRate || 0).toFixed(1)}%</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${this.getStatusBadge(result.status || 'unknown')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="text-blue-600 hover:text-blue-800 mr-2" 
                        onclick="viewDetails('${result.id || ''}')">
                        View
                    </button>
                    <button class="text-green-600 hover:text-green-800"
                        onclick="downloadReport('${result.id || ''}')">
                        Download
                    </button>
                </td>
            `;

            return row;
        } catch (error) {
            console.error('Error creating historical table row:', error);
            return document.createElement('tr');
        }
    }

    getStatusBadge(status) {
        const classes = {
            passed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800',
            unknown: 'bg-gray-100 text-gray-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || classes.unknown}">
                ${status.toUpperCase()}
            </span>
        `;
    }

    updatePagination(pagination) {
        const controls = document.getElementById('paginationControls');
        controls.innerHTML = `
            <button class="px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}"
                ${pagination.currentPage === 1 ? 'disabled' : ''}
                onclick="this.changePage(${pagination.currentPage - 1})">
                Previous
            </button>
            <span class="text-gray-700">
                Page ${pagination.currentPage} of ${pagination.totalPages}
            </span>
            <button class="px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}"
                ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}
                onclick="this.changePage(${pagination.currentPage + 1})">
                Next
            </button>
        `;
    }

    // Filter Handlers
    handleDateRangeChange(event) {
        if (event.target.value === 'custom') {
            this.showDateRangeModal();
        } else {
            this.currentFilters.dateRange = event.target.value;
        }
    }

    handleScriptFilterChange(event) {
        this.currentFilters.scripts = Array.from(event.target.selectedOptions).map(option => option.value);
    }

    handleStatusFilterChange(event) {
        this.currentFilters.status = event.target.value;
    }

    handleRowsPerPageChange(event) {
        this.currentFilters.pageSize = parseInt(event.target.value);
        this.currentFilters.currentPage = 1; // Reset to first page
        this.applyFilters();
    }

    async applyFilters() {
        try {
            const data = await this.dashboardManager.dataStore.getHistoricalData(this.currentFilters);
            this.updateContent(data);
        } catch (error) {
            console.error('Error applying filters:', error);
            this.dashboardManager.showError('Failed to apply filters');
        }
    }

    // Date Range Modal Methods
    showDateRangeModal() {
        document.getElementById('dateRangeModal').classList.remove('hidden');
    }

    hideDateRangeModal() {
        document.getElementById('dateRangeModal').classList.add('hidden');
    }

    applyCustomDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            this.dashboardManager.showError('Please select both start and end dates');
            return;
        }

        this.currentFilters.dateRange = 'custom';
        this.currentFilters.startDate = startDate;
        this.currentFilters.endDate = endDate;
        
        this.hideDateRangeModal();
        this.applyFilters();
    }

    // Comparison Methods
    handleSelectAll(event) {
        const checkboxes = document.querySelectorAll('.test-select');
        checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
        this.updateCompareButtonState();
    }

    updateCompareButtonState() {
        const selectedCount = document.querySelectorAll('.test-select:checked').length;
        const compareBtn = document.getElementById('compareSelectedBtn');
        compareBtn.disabled = selectedCount < 2;
        compareBtn.classList.toggle('opacity-50', selectedCount < 2);
    }

    async showComparisonAnalysis() {
        const selectedTests = Array.from(document.querySelectorAll('.test-select:checked'))
            .map(checkbox => checkbox.dataset.testId);
            
        try {
            const comparisonData = await this.dashboardManager.dataStore.compareTests(selectedTests);
            this.updateComparisonCharts(comparisonData);
            this.updateComparisonTable(comparisonData);
            document.getElementById('comparisonModal').classList.remove('hidden');
        } catch (error) {
            console.error('Error comparing tests:', error);
            this.dashboardManager.showError('Failed to compare selected tests');
        }
    }

    hideComparisonModal() {
        document.getElementById('comparisonModal').classList.add('hidden');
    }

    updateComparisonCharts(data) {
        // Update TPH Comparison Chart
        this.charts.comparisonTPH.data.labels = data.tests.map(test => test.date);
        this.charts.comparisonTPH.data.datasets = [{
            label: 'TPH',
            data: data.tests.map(test => test.tph),
            backgroundColor: 'rgba(59, 130, 246, 0.5)'
        }];
        this.charts.comparisonTPH.update();

        // Update Response Time Comparison Chart
        this.charts.comparisonRT.data.labels = data.tests.map(test => test.date);
        this.charts.comparisonRT.data.datasets = [{
            label: '95th Percentile Response Time',
            data: data.tests.map(test => test.responseTime95th),
            backgroundColor: 'rgba(16, 185, 129, 0.5)'
        }];
        this.charts.comparisonRT.update();
    }

    // Chart Configurations
   getTPHTrendConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Transactions Per Hour'
                        }
                    }
                }
            }
        };
    }

    getRTTrendConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (s)'
                        }
                    }
                }
            }
        };
    }

    getComparisonChartConfig(title) {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        };
    }

    // Utility Methods
    getScriptColor(scriptName) {
        const colors = [
            'rgb(59, 130, 246)',   // Blue
            'rgb(16, 185, 129)',   // Green
            'rgb(239, 68, 68)',    // Red
            'rgb(245, 158, 11)',   // Yellow
            'rgb(139, 92, 246)'    // Purple
        ];

        // Generate consistent color based on script name
        const hash = this.hashString(scriptName);
        return colors[hash % colors.length];
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    async exportHistoricalData() {
        try {
            await this.dashboardManager.dataStore.exportData('historical');
            this.dashboardManager.showSuccess('Historical data exported successfully');
        } catch (error) {
            console.error('Error exporting historical data:', error);
            this.dashboardManager.showError('Failed to export historical data');
        }
    }
}
