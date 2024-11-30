import { BaseTab } from './BaseTab.js';

export class SLAMetricsTab extends BaseTab {
    constructor(dashboardManager) {
        super(dashboardManager, 'sla');
        this.slaData = null;
    }

    createTabContent() {
    return `
        <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="tab-section">
                    <h3 class="text-gray-500 text-sm">Overall Compliance</h3>
                    <p class="text-3xl font-bold mt-2" id="overallCompliance">-</p>
                    <p class="text-sm text-gray-600 mt-1">Across all transactions</p>
                </div>
                <div class="tab-section">
                    <h3 class="text-gray-500 text-sm">Critical Transactions</h3>
                    <p class="text-3xl font-bold mt-2" id="criticalTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Requiring attention</p>
                </div>
                <div class="tab-section">
                    <h3 class="text-gray-500 text-sm">At Risk</h3>
                    <p class="text-3xl font-bold mt-2" id="atRiskTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Near threshold</p>
                </div>
                <div class="tab-section">
                    <h3 class="text-gray-500 text-sm">Healthy</h3>
                    <p class="text-3xl font-bold mt-2" id="healthyTransactions">-</p>
                    <p class="text-sm text-gray-600 mt-1">Within SLA</p>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="tab-section">
                    <h3 class="text-lg font-semibold mb-4">SLA Compliance Trends</h3>
                    <canvas id="slaTrendChart"></canvas>
                </div>
                <div class="tab-section">
                    <h3 class="text-lg font-semibold mb-4">Response Time Distribution</h3>
                    <canvas id="responseDistributionChart"></canvas>
                </div>
            </div>

            <!-- SLA Configuration Table -->
            <div class="tab-section">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">SLA Configuration</h3>
                    <div class="space-x-2">
                        <button id="editSLABtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Edit SLAs
                        </button>
                        <button id="exportSLABtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Export
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Script</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA Target</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current 95th RT</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody id="slaTableBody">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

    // Continuing SLAMetricsTab class...

    async load() {
        console.log('Loading SLA Metrics tab');
        try {
            this.slaData = await this.dashboardManager.dataStore.getSLAMetrics();
            console.log('SLA Metrics data:', this.slaData);
            
            this.destroyCharts();
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

   async initializeCharts() {
    try {
        // Wait for next tick to ensure DOM elements exist
        await new Promise(resolve => setTimeout(resolve, 0));

        // SLA Trend Chart
        const slaTrendCtx = document.getElementById('slaTrendChart');
        if (slaTrendCtx) {
            this.charts.slaTrend = new Chart(slaTrendCtx.getContext('2d'), {
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
            });
        }

        // Response Distribution Chart
        const responseDistCtx = document.getElementById('responseDistributionChart');
        if (responseDistCtx) {
            this.charts.responseDist = new Chart(responseDistCtx.getContext('2d'), {
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
            });
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

     updateContent(data) {
        if (!data) {
            console.warn('No SLA data provided');
            return;
        }

        try {
            if (data.summary) {
                this.updateSummaryCards(data.summary);
            }
            
            if (data.trends) {
                this.updateCharts(data);
            }
            
            if (Array.isArray(data.transactions)) {
                this.updateSLATable(data.transactions);
            }
        } catch (error) {
            console.error('Error updating SLA content:', error);
        }
    }

    updateSummaryCards(summary) {
        if (!summary) {
            console.warn('No summary data provided');
            return;
        }

        try {
            const elements = {
                overallCompliance: summary.overallCompliance || 0,
                criticalTransactions: summary.criticalCount || 0,
                atRiskTransactions: summary.atRiskCount || 0,
                healthyTransactions: summary.healthyCount || 0
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = this.formatValue(id, value);
                }
            });
        } catch (error) {
            console.error('Error updating summary cards:', error);
        }
    }

    formatValue(id, value) {
        switch (id) {
            case 'overallCompliance':
                return `${value.toFixed(1)}%`;
            default:
                return value.toString();
        }
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
        try {
            // Update SLA Trend Chart
            if (this.charts.slaTrend && data.trends) {
                this.charts.slaTrend.data.labels = data.trends.labels;
                this.charts.slaTrend.data.datasets[0].data = data.trends.compliance;
                this.charts.slaTrend.update();
            }

            // Update Response Distribution Chart
            if (this.charts.responseDist && data.distribution) {
                this.charts.responseDist.data.labels = data.distribution.labels;
                this.charts.responseDist.data.datasets[0].data = data.distribution.values;
                this.charts.responseDist.update();
            }

            // Update Breach History Chart
            if (this.charts.breachHistory && data.breachHistory) {
                this.charts.breachHistory.data.labels = data.breachHistory.labels;
                this.charts.breachHistory.data.datasets[0].data = data.breachHistory.values;
                this.charts.breachHistory.update();
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
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
