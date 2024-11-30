class SLAMetricsTab {
    constructor(dashboardManager) {
        this.dashboardManager = dashboardManager;
        this.charts = {};
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
        div.id = 'slaTab';
        div.className = 'tab-content hidden';
        
        div.innerHTML = `
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <!-- Overall SLA Compliance -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">Overall Compliance</h3>
                    <p class="text-3xl font-bold mt-2" id="overallCompliance">-</p>
                    <p class="text-sm text-gray-600 mt-1">Across all transactions</p>
                </div>
                
                <!-- Critical Transactions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">Critical Transactions</h3>
                    <p class="text-3xl font-bold mt-2" id="criticalTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Requiring immediate attention</p>
                </div>
                
                <!-- At Risk Transactions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">At Risk</h3>
                    <p class="text-3xl font-bold mt-2" id="atRiskTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Approaching SLA threshold</p>
                </div>
                
                <!-- Healthy Transactions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">Healthy</h3>
                    <p class="text-3xl font-bold mt-2" id="healthyTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Within SLA limits</p>
                </div>
            </div>

            <!-- SLA Analysis Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- SLA Trends -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">SLA Compliance Trends</h3>
                    <canvas id="slaTrendChart"></canvas>
                </div>
                
                <!-- Response Time Distribution -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Response Time Distribution</h3>
                    <canvas id="responseDistributionChart"></canvas>
                </div>
            </div>

            <!-- SLA Configuration Table -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">SLA Configuration</h3>
                    <div class="flex space-x-2">
                        <button id="editSLABtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Edit SLAs
                        </button>
                        <button id="exportSLABtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Export
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction Name
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Script Name
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SLA Target (s)
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current 95th RT
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Margin
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="slaTableBody">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SLA Edit Modal -->
            <div id="slaEditModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Edit SLA Configuration</h3>
                        <div id="slaEditForm">
                            <!-- Will be populated dynamically -->
                        </div>
                        <div class="mt-4 flex justify-end space-x-3">
                            <button id="cancelSLAEditBtn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                            <button id="saveSLABtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Breach Analysis Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Historical Breaches -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Historical SLA Breaches</h3>
                    <canvas id="breachHistoryChart"></canvas>
                </div>
                
                <!-- Risk Analysis -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Risk Analysis</h3>
                    <div id="riskAnalysis" class="space-y-4">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }

    setupEventListeners() {
        document.getElementById('editSLABtn').addEventListener('click', () => this.showEditModal());
        document.getElementById('exportSLABtn').addEventListener('click', () => this.exportSLAConfig());
        document.getElementById('cancelSLAEditBtn').addEventListener('click', () => this.hideEditModal());
        document.getElementById('saveSLABtn').addEventListener('click', () => this.saveSLAChanges());
    }

    initializeCharts() {
        // SLA Trend Chart
        this.charts.slaTrend = new Chart(
            document.getElementById('slaTrendChart').getContext('2d'),
            this.getSLATrendConfig()
        );

        // Response Distribution Chart
        this.charts.responseDistribution = new Chart(
            document.getElementById('responseDistributionChart').getContext('2d'),
            this.getResponseDistributionConfig()
        );

        // Breach History Chart
        this.charts.breachHistory = new Chart(
            document.getElementById('breachHistoryChart').getContext('2d'),
            this.getBreachHistoryConfig()
        );
    }

// Continuing SLAMetricsTab class...

    async load() {
        const slaData = await this.dashboardManager.dataStore.getSLAMetrics();
        this.updateContent(slaData);
    }

    updateContent(data) {
        this.updateSummaryCards(data.summary);
        this.updateCharts(data);
        this.updateSLATable(data.transactions);
        this.updateRiskAnalysis(data.riskAnalysis);
    }

    updateSummaryCards(summary) {
        document.getElementById('overallCompliance').textContent = `${summary.overallCompliance}%`;
        document.getElementById('criticalTransactions').textContent = summary.criticalCount;
        document.getElementById('atRiskTransactions').textContent = summary.atRiskCount;
        document.getElementById('healthyTransactions').textContent = summary.healthyCount;

        // Update card colors based on status
        this.updateCardColors(summary);
    }

    updateCardColors(summary) {
        const overallCard = document.getElementById('overallCompliance').parentElement;
        if (summary.overallCompliance < 95) {
            overallCard.classList.add('bg-red-50');
        } else if (summary.overallCompliance < 98) {
            overallCard.classList.add('bg-yellow-50');
        } else {
            overallCard.classList.add('bg-green-50');
        }
    }

    updateCharts(data) {
        // Update SLA Trend Chart
        this.updateSLATrendChart(data.trends);
        
        // Update Response Distribution Chart
        this.updateResponseDistributionChart(data.distribution);
        
        // Update Breach History Chart
        this.updateBreachHistoryChart(data.breachHistory);
    }

    updateSLATrendChart(trends) {
        this.charts.slaTrend.data.labels = trends.labels;
        this.charts.slaTrend.data.datasets = [{
            label: 'SLA Compliance %',
            data: trends.compliance,
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1
        }];
        this.charts.slaTrend.update();
    }

    updateResponseDistributionChart(distribution) {
        this.charts.responseDistribution.data.labels = distribution.labels;
        this.charts.responseDistribution.data.datasets = [{
            label: 'Response Time Distribution',
            data: distribution.values,
            backgroundColor: distribution.values.map(value => 
                this.getDistributionColor(value, distribution.threshold)
            )
        }];
        this.charts.responseDistribution.update();
    }

    updateBreachHistoryChart(history) {
        this.charts.breachHistory.data.labels = history.labels;
        this.charts.breachHistory.data.datasets = [{
            label: 'SLA Breaches',
            data: history.breaches,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1
        }];
        this.charts.breachHistory.update();
    }

    updateSLATable(transactions) {
        const tbody = document.getElementById('slaTableBody');
        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = this.createSLATableRow(transaction);
            tbody.appendChild(row);
        });
    }

    createSLATableRow(transaction) {
        const row = document.createElement('tr');
        const margin = ((transaction.slaTarget - transaction.current95thRT) / transaction.slaTarget) * 100;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${transaction.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${transaction.scriptName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${transaction.slaTarget}s</td>
            <td class="px-6 py-4 whitespace-nowrap">${transaction.current95thRT}s</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${this.getMarginClass(margin)}">
                    ${margin.toFixed(1)}%
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${this.getSLAStatusBadge(transaction.status)}
            </td>
        `;

        // Add click handler for row details
        row.addEventListener('click', () => this.showTransactionDetails(transaction));
        return row;
    }

    updateRiskAnalysis(riskData) {
        const container = document.getElementById('riskAnalysis');
        container.innerHTML = `
            <div class="space-y-6">
                ${riskData.map(risk => `
                    <div class="border-l-4 ${this.getRiskBorderColor(risk.level)} pl-4">
                        <h4 class="font-medium">${risk.transaction}</h4>
                        <p class="text-sm text-gray-600 mt-1">${risk.analysis}</p>
                        <div class="mt-2">
                            ${this.generateRiskFactors(risk.factors)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showEditModal() {
        const modal = document.getElementById('slaEditModal');
        const form = document.getElementById('slaEditForm');
        
        // Get current SLA configuration
        const currentConfig = this.dashboardManager.dataStore.getCurrentSLAConfig();
        
        form.innerHTML = this.generateSLAEditForm(currentConfig);
        modal.classList.remove('hidden');
    }

    generateSLAEditForm(config) {
        return `
            <div class="space-y-4">
                ${config.transactions.map(trans => `
                    <div class="border rounded p-4">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-medium">${trans.name}</h4>
                            <span class="text-sm text-gray-500">${trans.scriptName}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">SLA Target (seconds)</label>
                                <input type="number" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value="${trans.slaTarget}"
                                    step="0.1"
                                    min="0"
                                    data-transaction="${trans.name}"
                                    data-field="slaTarget">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Priority Level</label>
                                <select 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    data-transaction="${trans.name}"
                                    data-field="priority">
                                    <option value="high" ${trans.priority === 'high' ? 'selected' : ''}>High</option>
                                    <option value="medium" ${trans.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="low" ${trans.priority === 'low' ? 'selected' : ''}>Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async saveSLAChanges() {
        try {
            const formData = this.collectSLAFormData();
            await this.validateSLAChanges(formData);
            
            await this.dashboardManager.dataStore.updateSLAConfig(formData);
            this.hideEditModal();
            this.load(); // Reload the tab data
            this.showSuccess('SLA configuration updated successfully');
        } catch (error) {
            this.showError(`Failed to save SLA changes: ${error.message}`);
        }
    }

    collectSLAFormData() {
        const form = document.getElementById('slaEditForm');
        const data = {
            transactions: []
        };

        // Group inputs by transaction
        const transactions = new Map();
        form.querySelectorAll('input, select').forEach(input => {
            const { transaction, field } = input.dataset;
            if (!transactions.has(transaction)) {
                transactions.set(transaction, {});
            }
            transactions.get(transaction)[field] = input.value;
        });

        // Convert to array
        transactions.forEach((values, transactionName) => {
            data.transactions.push({
                name: transactionName,
                ...values
            });
        });

        return data;
    }

    // Utility methods for styling and formatting
    getDistributionColor(value, threshold) {
        if (value > threshold) {
            return 'rgba(239, 68, 68, 0.5)'; // red
        }
        return 'rgba(59, 130, 246, 0.5)'; // blue
    }

    getMarginClass(margin) {
        if (margin < 0) return 'text-red-600 font-semibold';
        if (margin < 20) return 'text-yellow-600 font-semibold';
        return 'text-green-600 font-semibold';
    }

    getSLAStatusBadge(status) {
        const classes = {
            'critical': 'bg-red-100 text-red-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'healthy': 'bg-green-100 text-green-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[status.toLowerCase()]}">
                ${status}
            </span>
        `;
    }

    getRiskBorderColor(level) {
        const colors = {
            'high': 'border-red-500',
            'medium': 'border-yellow-500',
            'low': 'border-green-500'
        };
        return colors[level.toLowerCase()] || 'border-gray-500';
    }

    generateRiskFactors(factors) {
        return `
            <ul class="mt-2 space-y-1">
                ${factors.map(factor => `
                    <li class="text-sm flex items-center">
                        <svg class="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                        </svg>
                        ${factor}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // Chart configuration methods
    getSLATrendConfig() {
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
                        max: 100
                    }
                }
            }
        };
    }

    getResponseDistributionConfig() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }

    getBreachHistoryConfig() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }
}
    	