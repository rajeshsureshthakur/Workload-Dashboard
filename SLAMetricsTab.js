import { BaseTab } from './BaseTab.js';

export class SLAMetricsTab extends BaseTab {
    constructor(dashboardManager) {
        super(dashboardManager, 'sla');
        this.slaData = null;
    }

    createTabContent() {
        const content = document.createElement('div');
        content.id = 'slaTab';
        content.className = 'tab-content hidden';
        
        content.innerHTML = `
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">Overall Compliance</h3>
                    <p class="text-3xl font-bold mt-2" id="overallCompliance">-</p>
                    <p class="text-sm text-gray-600 mt-1">Across all transactions</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">Critical Transactions</h3>
                    <p class="text-3xl font-bold mt-2" id="criticalTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Requiring immediate attention</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">At Risk</h3>
                    <p class="text-3xl font-bold mt-2" id="atRiskTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Approaching SLA threshold</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-gray-500 text-sm font-medium">Healthy</h3>
                    <p class="text-3xl font-bold mt-2" id="healthyTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Within SLA limits</p>
                </div>
            </div>

            <!-- SLA Analysis Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">SLA Compliance Trends</h3>
                    <canvas id="slaTrendChart"></canvas>
                </div>
                
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

            <!-- Breach Analysis Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Historical SLA Breaches</h3>
                    <canvas id="breachHistoryChart"></canvas>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Risk Analysis</h3>
                    <div id="riskAnalysis" class="space-y-4">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>

            <!-- Edit SLA Modal -->
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
        `;
        
        return content;
    }

    // Continuing SLAMetricsTab class...

    async load() {
        try {
            this.slaData = await this.dashboardManager.dataStore.getSLAMetrics();
            this.setupEventListeners();
            this.initializeCharts();
            this.updateContent(this.slaData);
        } catch (error) {
            console.error('Error loading SLA metrics:', error);
            this.dashboardManager.showError('Failed to load SLA metrics data');
        }
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
        this.charts.responseDist = new Chart(
            document.getElementById('responseDistributionChart').getContext('2d'),
            this.getResponseDistConfig()
        );

        // Breach History Chart
        this.charts.breachHistory = new Chart(
            document.getElementById('breachHistoryChart').getContext('2d'),
            this.getBreachHistoryConfig()
        );
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

        // Update card colors based on compliance level
        this.updateComplianceCardColors(summary.overallCompliance);
    }

    updateComplianceCardColors(compliance) {
        const card = document.getElementById('overallCompliance').parentElement;
        if (compliance < 95) {
            card.classList.add('bg-red-50');
        } else if (compliance < 98) {
            card.classList.add('bg-yellow-50');
        } else {
            card.classList.add('bg-green-50');
        }
    }

    updateCharts(data) {
        // Update SLA Trend Chart
        this.charts.slaTrend.data.labels = data.trends.labels;
        this.charts.slaTrend.data.datasets[0].data = data.trends.values;
        this.charts.slaTrend.update();

        // Update Response Distribution Chart
        this.charts.responseDist.data.labels = data.distribution.labels;
        this.charts.responseDist.data.datasets[0].data = data.distribution.values;
        this.charts.responseDist.update();

        // Update Breach History Chart
        this.charts.breachHistory.data.labels = data.breachHistory.labels;
        this.charts.breachHistory.data.datasets[0].data = data.breachHistory.values;
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
        const margin = ((transaction.slaTarget - transaction.current95thRT) / transaction.slaTarget) * 100;
        
        const row = document.createElement('tr');
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

        // Add click handler to show details
        row.addEventListener('click', () => this.showTransactionDetails(transaction));
        return row;
    }

    updateRiskAnalysis(riskData) {
        const container = document.getElementById('riskAnalysis');
        container.innerHTML = riskData.map(risk => this.createRiskAnalysisCard(risk)).join('');
    }

    createRiskAnalysisCard(risk) {
        return `
            <div class="border-l-4 ${this.getRiskBorderColor(risk.level)} pl-4">
                <h4 class="font-medium">${risk.transaction}</h4>
                <p class="text-sm text-gray-600 mt-1">${risk.analysis}</p>
                <div class="mt-2">
                    <ul class="text-sm space-y-1">
                        ${risk.factors.map(factor => `
                            <li class="flex items-center">
                                <svg class="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                                </svg>
                                ${factor}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    showEditModal() {
        const modal = document.getElementById('slaEditModal');
        const form = document.getElementById('slaEditForm');
        form.innerHTML = this.generateSLAEditForm(this.slaData.transactions);
        modal.classList.remove('hidden');
    }

    hideEditModal() {
        document.getElementById('slaEditModal').classList.add('hidden');
    }

    generateSLAEditForm(transactions) {
        return `
            <div class="space-y-4">
                ${transactions.map(trans => `
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
            this.dashboardManager.showSuccess('SLA configuration updated successfully');
        } catch (error) {
            console.error('Error saving SLA changes:', error);
            this.dashboardManager.showError('Failed to save SLA changes: ' + error.message);
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

    // Chart Configurations
    getSLATrendConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'SLA Compliance %',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.1
                }]
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

    getResponseDistConfig() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Response Time Distribution',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)'
                }]
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
                datasets: [{
                    label: 'SLA Breaches',
                    data: [],
                    backgroundColor: 'rgba(239, 68, 68, 0.5)'
                }]
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

    // Utility Methods
    getMarginClass(margin) {
        if (margin < 0) return 'text-red-600 font-semibold';
        if (margin < 20) return 'text-yellow-600 font-semibold';
        return 'text-green-600 font-semibold';
    }

    getSLAStatusBadge(status) {
        const classes = {
            critical: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800',
            healthy: 'bg-green-100 text-green-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[status.toLowerCase()]}">
                ${status}
            </span>
        `;
    }

    getRiskBorderColor(level) {
        const colors = {
            high: 'border-red-500',
            medium: 'border-yellow-500',
            low: 'border-green-500'
        };
        return colors[level.toLowerCase()] || 'border-gray-500';
    }

}