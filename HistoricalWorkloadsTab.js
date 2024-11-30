class HistoricalWorkloadsTab {
    constructor(dashboardManager) {
        this.dashboardManager = dashboardManager;
        this.charts = {};
        this.currentFilters = {
            dateRange: '1month',
            scripts: [],
            status: 'all'
        };
        this.initializeTab();
    }

    initializeTab() {
        const tabContent = this.createTabContent();
        document.querySelector('main').appendChild(tabContent);
        this.setupEventListeners();
        this.initializeCharts();
    }

    createTabContent() {
        const div = document.createElement('div');
        div.id = 'historicalTab';
        div.className = 'tab-content hidden';
        
        div.innerHTML = `
            <!-- Filters Section -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <!-- Date Range Filter -->
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Date Range:</label>
                        <select id="dateRangeFilter" class="rounded-md border-gray-300 shadow-sm">
                            <option value="1week">Last Week</option>
                            <option value="1month" selected>Last Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    <!-- Script Filter -->
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Scripts:</label>
                        <select id="scriptFilter" class="rounded-md border-gray-300 shadow-sm" multiple>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Status:</label>
                        <select id="statusFilter" class="rounded-md border-gray-300 shadow-sm">
                            <option value="all">All Status</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                            <option value="warning">Warning</option>
                        </select>
                    </div>

                    <!-- Apply Filters Button -->
                    <button id="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Apply Filters
                    </button>
                </div>

                <!-- Custom Date Range Modal -->
                <div id="dateRangeModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div class="mt-3">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Select Date Range</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" id="startDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">End Date</label>
                                    <input type="date" id="endDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                </div>
                                <div class="flex justify-end space-x-3">
                                    <button id="cancelDateRange" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                                        Cancel
                                    </button>
                                    <button id="applyDateRange" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trends Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- TPH Trend -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">TPH Trend</h3>
                    <canvas id="tphTrendHistoryChart"></canvas>
                </div>

                <!-- Response Time Trend -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Response Time Trend</h3>
                    <canvas id="rtTrendHistoryChart"></canvas>
                </div>
            </div>

            <!-- Historical Data Table -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Historical Test Results</h3>
                    <button id="exportHistoricalData" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Export Data
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Script Name
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TPH
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    VUsers
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    95th RT
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Success Rate
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="historicalDataBody">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
                <!-- Pagination -->
                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-700">Rows per page:</span>
                        <select id="rowsPerPage" class="rounded-md border-gray-300 shadow-sm">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="flex items-center space-x-2" id="paginationControls">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>

            <!-- Comparison Analysis -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Comparison Analysis</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Performance Comparison Chart -->
                    <div>
                        <canvas id="performanceComparisonChart"></canvas>
                    </div>
                    <!-- Key Metrics Comparison -->
                    <div id="metricsComparison" class="space-y-4">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }

    // Continuing HistoricalWorkloadsTab class...

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('dateRangeFilter').addEventListener('change', (e) => this.handleDateRangeChange(e));
        document.getElementById('scriptFilter').addEventListener('change', (e) => this.handleScriptFilterChange(e));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.handleStatusFilterChange(e));
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());

        // Date range modal events
        document.getElementById('cancelDateRange').addEventListener('click', () => this.hideDateRangeModal());
        document.getElementById('applyDateRange').addEventListener('click', () => this.applyCustomDateRange());

        // Export button
        document.getElementById('exportHistoricalData').addEventListener('click', () => this.exportHistoricalData());

        // Pagination events
        document.getElementById('rowsPerPage').addEventListener('change', (e) => this.handleRowsPerPageChange(e));
    }

    initializeCharts() {
        // TPH Trend Chart
        this.charts.tphTrend = new Chart(
            document.getElementById('tphTrendHistoryChart').getContext('2d'),
            this.getTPHTrendConfig()
        );

        // Response Time Trend Chart
        this.charts.rtTrend = new Chart(
            document.getElementById('rtTrendHistoryChart').getContext('2d'),
            this.getResponseTimeTrendConfig()
        );

        // Performance Comparison Chart
        this.charts.performanceComparison = new Chart(
            document.getElementById('performanceComparisonChart').getContext('2d'),
            this.getPerformanceComparisonConfig()
        );
    }

    async load() {
        await this.loadScriptOptions();
        const historicalData = await this.dashboardManager.dataStore.getHistoricalData(this.currentFilters);
        this.updateContent(historicalData);
    }

    async loadScriptOptions() {
        const scripts = await this.dashboardManager.dataStore.getAvailableScripts();
        const select = document.getElementById('scriptFilter');
        select.innerHTML = scripts.map(script => 
            `<option value="${script.id}">${script.name}</option>`
        ).join('');
    }

    updateContent(data) {
        this.updateCharts(data);
        this.updateHistoricalTable(data.testResults);
        this.updateComparisonAnalysis(data.comparison);
        this.updatePagination(data.pagination);
    }

    updateCharts(data) {
        // Update TPH Trend Chart
        this.updateTPHTrendChart(data.tphTrend);
        
        // Update Response Time Trend Chart
        this.updateResponseTimeTrendChart(data.rtTrend);
        
        // Update Performance Comparison Chart
        this.updatePerformanceComparisonChart(data.comparison);
    }

    updateTPHTrendChart(trendData) {
        const datasets = Object.keys(trendData.series).map(scriptName => ({
            label: scriptName,
            data: trendData.series[scriptName],
            borderColor: this.getScriptColor(scriptName),
            tension: 0.1
        }));

        this.charts.tphTrend.data.labels = trendData.dates;
        this.charts.tphTrend.data.datasets = datasets;
        this.charts.tphTrend.update();
    }

    updateResponseTimeTrendChart(trendData) {
        const datasets = Object.keys(trendData.series).map(scriptName => ({
            label: scriptName,
            data: trendData.series[scriptName],
            borderColor: this.getScriptColor(scriptName),
            tension: 0.1
        }));

        this.charts.rtTrend.data.labels = trendData.dates;
        this.charts.rtTrend.data.datasets = datasets;
        this.charts.rtTrend.update();
    }

    updatePerformanceComparisonChart(comparisonData) {
        this.charts.performanceComparison.data.labels = comparisonData.metrics;
        this.charts.performanceComparison.data.datasets = [
            {
                label: 'Previous',
                data: comparisonData.previous,
                backgroundColor: 'rgba(59, 130, 246, 0.5)'
            },
            {
                label: 'Current',
                data: comparisonData.current,
                backgroundColor: 'rgba(16, 185, 129, 0.5)'
            }
        ];
        this.charts.performanceComparison.update();
    }

    updateHistoricalTable(results) {
        const tbody = document.getElementById('historicalDataBody');
        tbody.innerHTML = '';

        results.forEach(result => {
            const row = this.createHistoricalTableRow(result);
            tbody.appendChild(row);
        });
    }

    createHistoricalTableRow(result) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                ${moment(result.date).format('YYYY-MM-DD HH:mm')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${result.scriptName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${result.tph.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap">${result.vusers}</td>
            <td class="px-6 py-4 whitespace-nowrap">${result.responseTime95th}s</td>
            <td class="px-6 py-4 whitespace-nowrap">${result.successRate}%</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${this.getStatusBadge(result.status)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-600 hover:text-blue-800 mr-2" 
                    onclick="viewDetails('${result.id}')">
                    View
                </button>
                <button class="text-green-600 hover:text-green-800"
                    onclick="compareResults('${result.id}')">
                    Compare
                </button>
            </td>
        `;
        return row;
    }

    updateComparisonAnalysis(comparison) {
        const container = document.getElementById('metricsComparison');
        container.innerHTML = this.generateComparisonHTML(comparison);
    }

    generateComparisonHTML(comparison) {
        return `
            <div class="space-y-4">
                ${comparison.metrics.map(metric => `
                    <div class="border-l-4 ${this.getMetricBorderColor(metric)} pl-4">
                        <h4 class="font-medium">${metric.name}</h4>
                        <div class="flex items-center space-x-4 mt-2">
                            <span class="text-gray-600">Previous: ${metric.previous}</span>
                            <span class="text-gray-600">Current: ${metric.current}</span>
                            <span class="${this.getChangeClass(metric.change)}">
                                ${this.formatChange(metric.change)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updatePagination(pagination) {
        const controls = document.getElementById('paginationControls');
        controls.innerHTML = `
            <button class="px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}"
                ${pagination.currentPage === 1 ? 'disabled' : ''}
                onclick="changePage(${pagination.currentPage - 1})">
                Previous
            </button>
            <span class="text-gray-700">
                Page ${pagination.currentPage} of ${pagination.totalPages}
            </span>
            <button class="px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}"
                ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}
                onclick="changePage(${pagination.currentPage + 1})">
                Next
            </button>
        `;
    }

    // Event Handlers
    handleDateRangeChange(event) {
        if (event.target.value === 'custom') {
            this.showDateRangeModal();
        } else {
            this.currentFilters.dateRange = event.target.value;
        }
    }

    handleScriptFilterChange(event) {
        const selectedOptions = Array.from(event.target.selectedOptions);
        this.currentFilters.scripts = selectedOptions.map(option => option.value);
    }

    handleStatusFilterChange(event) {
        this.currentFilters.status = event.target.value;
    }

    async applyFilters() {
        await this.load();
    }

    handleRowsPerPageChange(event) {
        this.currentFilters.pageSize = parseInt(event.target.value);
        this.load();
    }

    // Utility Methods
    getScriptColor(scriptName) {
        // Generate consistent color based on script name
        const hash = this.hashString(scriptName);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    getStatusBadge(status) {
        const classes = {
            passed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[status.toLowerCase()]}">
                ${status}
            </span>
        `;
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
                plugins: {
                    title: {
                        display: true,
                        text: 'TPH Trend Over Time'
                    }
                },
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

    getResponseTimeTrendConfig() {
        return {
            type: 'line',
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
                        text: '95th Percentile Response Time Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (seconds)'
                        }
                    }
                }
            }
        };
    }

    getPerformanceComparisonConfig() {
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
                        text: 'Performance Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }
}