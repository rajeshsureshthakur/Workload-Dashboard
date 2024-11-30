import { BaseTab } from './BaseTab.js';

export class CurrentWorkloadTab extends BaseTab {
    constructor(dashboardManager) {
        super(dashboardManager, 'current');
        this.charts = {};
    }

    createTabContent() {
        const content = document.createElement('div');
        content.id = 'currentTab';
        content.className = 'tab-content hidden';
        
        content.innerHTML = `
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm">Current TPH</h3>
                    <p class="text-3xl font-bold mt-2" id="currentTPH">-</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm">Active VUsers</h3>
                    <p class="text-3xl font-bold mt-2" id="activeVUsers">-</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm">Success Rate</h3>
                    <p class="text-3xl font-bold mt-2" id="currentSuccessRate">-</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm">Avg Response Time</h3>
                    <p class="text-3xl font-bold mt-2" id="avgResponseTime">-</p>
                </div>
            </div>

            <!-- Performance Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Response Time Trend</h3>
                    <canvas id="currentRTChart" height="300"></canvas>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Throughput Trend</h3>
                    <canvas id="currentTPHChart" height="300"></canvas>
                </div>
            </div>

            <!-- Transaction Details -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Transaction Details</h3>
                    <button id="exportCurrentBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Export Details
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Script</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TPH</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody id="transactionTableBody" class="bg-white divide-y divide-gray-200">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Real-time Alerts -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Current Alerts</h3>
                <div id="alertsContainer" class="space-y-4">
                    <!-- Will be populated dynamically -->
                </div>
            </div>
        `;

        return content;
    }

    async load() {
        console.log('Loading Current Workload tab');
        try {
            const data = await this.dashboardManager.dataStore.getCurrentData();
            console.log('Current Workload data:', data);
            this.destroyCharts();
            this.initializeCharts();
            this.updateContent(data);
        } catch (error) {
            console.error('Error loading current workload data:', error);
            this.dashboardManager.showError('Failed to load current workload data');
        }
    }

    setupEventListeners() {
        document.getElementById('exportCurrentBtn').addEventListener('click', () => this.exportCurrentData());
    }

    initializeCharts() {
        // Response Time Chart
        const rtCtx = document.getElementById('currentRTChart')?.getContext('2d');
        if (rtCtx) {
            this.charts.responseTime = new Chart(rtCtx, this.getResponseTimeChartConfig());
        }

        // Throughput Chart
        const tpCtx = document.getElementById('currentTPHChart')?.getContext('2d');
        if (tpCtx) {
            this.charts.throughput = new Chart(tpCtx, this.getThroughputChartConfig());
        }
    }

    update(data) {
        console.log('Updating Current Workload tab with data:', data);
        this.updateContent(data);
    }


   updateContent(data) {
        if (!data) {
            console.warn('No data provided to updateContent');
            return;
        }

        try {
            if (data.summary) {
                this.updateSummaryCards(data.summary);
            }
            
            if (data.trends) {
                this.updateCharts(data.trends);
            }
            
            if (Array.isArray(data.transactions)) {
                this.updateTransactionTable(data.transactions);
            }
        } catch (error) {
            console.error('Error updating content:', error);
        }
    }


     updateSummaryCards(summary) {
        const elements = {
            currentTPH: summary.totalTPH,
            activeVUsers: summary.totalVUsers,
            currentSuccessRate: summary.successRate,
            avgResponseTime: summary.avgResponseTime
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.formatValue(id, value);
            }
        });
    }

    updateCharts(trends) {
        if (this.charts.responseTime) {
            this.charts.responseTime.data.labels = trends.labels;
            this.charts.responseTime.data.datasets[0].data = trends.responseTimeSeries;
            this.charts.responseTime.update();
        }

        if (this.charts.throughput) {
            this.charts.throughput.data.labels = trends.labels;
            this.charts.throughput.data.datasets[0].data = trends.throughputSeries;
            this.charts.throughput.update();
        }
    }

    updateTransactionTable(transactions) {
        const tbody = document.getElementById('transactionTableBody');
        if (!tbody) {
            console.warn('Transaction table body element not found');
            return;
        }

        tbody.innerHTML = '';

        if (!Array.isArray(transactions)) {
            console.warn('Invalid transactions data:', transactions);
            return;
        }

        transactions.forEach(transaction => {
            try {
                const row = this.createTransactionRow(transaction);
                tbody.appendChild(row);
            } catch (error) {
                console.error('Error creating transaction row:', error);
            }
        });
    }

    createTransactionRow(transaction) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${transaction.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${transaction.script || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${this.formatNumber(transaction.tph) || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${transaction.responseTime?.toFixed(2) || '0.00'}s</td>
            <td class="px-6 py-4 whitespace-nowrap">${transaction.successRate?.toFixed(1) || '0.0'}%</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${this.getStatusBadge(transaction.status || 'unknown')}
            </td>
        `;
        return row;
    }

    updateAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = '';

        alerts.forEach(alert => {
            const alertElement = this.createAlertElement(alert);
            container.appendChild(alertElement);
        });
    }

    createAlertElement(alert) {
        const div = document.createElement('div');
        div.className = `p-4 rounded-lg ${this.getAlertClass(alert.severity)}`;
        div.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    ${this.getAlertIcon(alert.severity)}
                </div>
                <div class="ml-3">
                    <h4 class="text-sm font-medium">${alert.title}</h4>
                    <p class="text-sm mt-1">${alert.message}</p>
                    <p class="text-xs mt-1 text-gray-500">${this.formatTimestamp(alert.timestamp)}</p>
                </div>
            </div>
        `;
        return div;
    }

    async exportCurrentData() {
        try {
            await this.dashboardManager.exportData('current');
            this.dashboardManager.showSuccess('Current data exported successfully');
        } catch (error) {
            console.error('Error exporting current data:', error);
            this.dashboardManager.showError('Failed to export current data');
        }
    }

    // Chart Configurations
  getResponseTimeChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Response Time',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        };
    }

   getThroughputChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Throughput',
                    data: [],
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        };
    }
    // Utility Methods
    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    }

    formatValue(id, value) {
        switch (id) {
            case 'currentSuccessRate':
                return `${value.toFixed(1)}%`;
            case 'avgResponseTime':
                return `${value.toFixed(2)}s`;
            case 'currentTPH':
                return this.formatNumber(value);
            default:
                return value.toString();
        }
    }


    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    getStatusBadge(status) {
        const classes = {
            healthy: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800',
            unknown: 'bg-gray-100 text-gray-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || classes.unknown}">
                ${status.toUpperCase()}
            </span>
        `;
    }
    getAlertClass(severity) {
        const classes = {
            high: 'bg-red-50 text-red-800',
            medium: 'bg-yellow-50 text-yellow-800',
            low: 'bg-blue-50 text-blue-800'
        };
        return classes[severity] || classes.low;
    }

    getAlertIcon(severity) {
        // Return appropriate SVG icon based on severity
        return `<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <!-- Icon path based on severity -->
        </svg>`;
    }
}
