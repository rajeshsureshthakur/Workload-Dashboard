import { BaseTab } from './BaseTab.js';

export class PlannedWorkloadTab extends BaseTab {
    constructor(dashboardManager) {
        super(dashboardManager, 'planned');
        this.plannedWorkload = null;
    }

    update(data) {
        console.log('Updating Planned Workload tab with data:', data);
        this.updateContent(data);
    }

    updateContent(data) {
        if (!data || !data.planned) {
            console.warn('No planned workload data available');
            return;
        }

        try {
            this.updateSummarySection(data.planned.summary);
            this.updateCharts(data.planned);
            this.updateWorkloadTable(data.planned.scripts);
            this.updatePacingStrategy(data.planned.pacing);
            this.updateResourceRequirements(data.planned.resources);
        } catch (error) {
            console.error('Error updating planned workload content:', error);
        }
    }

    updateSummarySection(summary = {}) {
        const totalTPH = document.getElementById('totalPlannedTPH');
        if (totalTPH) {
            totalTPH.textContent = this.formatNumber(summary.totalTPH || 0);
        }
    }

    async load() {
        try {
            console.log('Loading Planned Workload tab');
            const data = await this.dashboardManager.dataStore.getPlannedWorkload();
            this.plannedWorkload = data;
            
            // Initialize charts if they haven't been initialized
            if (Object.keys(this.charts).length === 0) {
                this.initializeCharts();
            }
            
            this.updateContent({ planned: data });
        } catch (error) {
            console.error('Error loading planned workload:', error);
            this.dashboardManager.showError('Failed to load planned workload data');
        }
    }


    createTabContent() {
        const content = document.createElement('div');
        content.id = 'plannedTab';
        content.className = 'tab-content hidden';
        
        content.innerHTML = `
            <!-- Summary Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Total Load -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Total Planned Load</h3>
                    <div class="text-center">
                        <p class="text-3xl font-bold" id="totalPlannedTPH">-</p>
                        <p class="text-gray-600 mt-2">Transactions Per Hour</p>
                    </div>
                </div>

                <!-- Script Distribution -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Script Distribution</h3>
                    <canvas id="scriptDistributionChart"></canvas>
                </div>

                <!-- Resource Requirements -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Resource Requirements</h3>
                    <div id="resourceRequirements" class="space-y-4">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>

            <!-- Detailed Workload Table -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Planned Workload Details</h3>
                    <div class="flex space-x-2">
                        <button id="editWorkloadBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Edit Workload
                        </button>
                        <button id="exportWorkloadBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Export
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Script Name
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Planned TPH
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Required VUsers
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pacing (seconds)
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Think Time
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody id="workloadTableBody" class="bg-white divide-y divide-gray-200">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Configuration Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Pacing Strategy -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Pacing Strategy</h3>
                    <div id="pacingStrategy" class="space-y-4">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>

                <!-- VUser Distribution -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">VUser Distribution</h3>
                    <canvas id="vuserDistributionChart"></canvas>
                </div>
            </div>

            <!-- Edit Workload Modal -->
            <div id="editWorkloadModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Workload Configuration</h3>
                        <div id="editWorkloadForm">
                            <!-- Will be populated dynamically -->
                        </div>
                        <div class="mt-4 flex justify-end space-x-3">
                            <button id="cancelEditBtn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                            <button id="saveWorkloadBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return content;
    }

    // Continue with additional methods...


// Continuing PlannedWorkloadTab class...

    

    setupEventListeners() {
        document.getElementById('editWorkloadBtn').addEventListener('click', () => this.showEditModal());
        document.getElementById('exportWorkloadBtn').addEventListener('click', () => this.exportWorkload());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.hideEditModal());
        document.getElementById('saveWorkloadBtn').addEventListener('click', () => this.saveWorkloadChanges());
    }

    initializeCharts() {
        // Initialize Script Distribution Chart
        this.charts.scriptDist = new Chart(
            document.getElementById('scriptDistributionChart').getContext('2d'),
            this.getScriptDistributionConfig()
        );

        // Initialize VUser Distribution Chart
        this.charts.vuserDist = new Chart(
            document.getElementById('vuserDistributionChart').getContext('2d'),
            this.getVUserDistributionConfig()
        );
    }

  

    updateCharts(data) {
        try {
            // Update Script Distribution Chart
            if (this.charts.scriptDist) {
                const scriptData = {
                    labels: data.scripts?.map(script => script.name) || [],
                    values: data.scripts?.map(script => script.plannedTPH) || []
                };
                
                this.charts.scriptDist.data.labels = scriptData.labels;
                this.charts.scriptDist.data.datasets[0].data = scriptData.values;
                this.charts.scriptDist.update();
            }

            // Update VUser Distribution Chart
            if (this.charts.vuserDist) {
                const vuserData = {
                    labels: data.scripts?.map(script => script.name) || [],
                    values: data.scripts?.map(script => script.requiredVUsers) || []
                };
                
                this.charts.vuserDist.data.labels = vuserData.labels;
                this.charts.vuserDist.data.datasets[0].data = vuserData.values;
                this.charts.vuserDist.update();
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }


    updateWorkloadTable(scripts) {
        const tbody = document.getElementById('workloadTableBody');
        tbody.innerHTML = '';

        scripts.forEach(script => {
            const row = this.createWorkloadTableRow(script);
            tbody.appendChild(row);
        });
    }

    createWorkloadTableRow(script) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${script.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${this.formatNumber(script.plannedTPH)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${script.requiredVUsers}</td>
            <td class="px-6 py-4 whitespace-nowrap">${script.pacing.toFixed(2)}s</td>
            <td class="px-6 py-4 whitespace-nowrap">${script.thinkTime.toFixed(2)}s</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${this.getStatusBadge(script.status)}
            </td>
        `;
        return row;
    }

    updatePacingStrategy(pacing) {
        const container = document.getElementById('pacingStrategy');
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Strategy Type:</span>
                    <span class="font-semibold">${pacing.strategyType}</span>
                </div>
                <div>
                    <h4 class="text-sm font-medium mb-2">Pacing Distribution</h4>
                    <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                        ${this.generatePacingDistributionBars(pacing.distribution)}
                    </div>
                </div>
                <div class="text-sm text-gray-600">
                    <p class="mb-2">${pacing.description}</p>
                    <ul class="list-disc list-inside space-y-1">
                        ${pacing.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    updateResourceRequirements(resources) {
        const container = document.getElementById('resourceRequirements');
        container.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total VUsers:</span>
                    <span class="font-semibold">${resources.totalVUsers}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Memory Usage:</span>
                    <span class="font-semibold">${resources.estimatedMemory} GB</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">CPU Cores:</span>
                    <span class="font-semibold">${resources.estimatedCPU}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Network Bandwidth:</span>
                    <span class="font-semibold">${resources.estimatedBandwidth} Mbps</span>
                </div>
                <div class="mt-4 pt-3 border-t">
                    <div class="text-sm ${this.getResourceWarningClass(resources.warningLevel)}">
                        ${this.getResourceWarningMessage(resources)}
                    </div>
                </div>
            </div>
        `;
    }

    showEditModal() {
        const modal = document.getElementById('editWorkloadModal');
        const form = document.getElementById('editWorkloadForm');
        
        form.innerHTML = this.generateEditForm(this.plannedWorkload);
        modal.classList.remove('hidden');
    }

    hideEditModal() {
        document.getElementById('editWorkloadModal').classList.add('hidden');
    }

    generateEditForm(data) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${data.scripts.map(script => `
                    <div class="border rounded-lg p-4">
                        <h4 class="font-medium mb-3">${script.name}</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Planned TPH</label>
                                <input type="number" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value="${script.plannedTPH}"
                                    data-script="${script.name}"
                                    data-field="plannedTPH">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Think Time (seconds)</label>
                                <input type="number" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value="${script.thinkTime}"
                                    data-script="${script.name}"
                                    data-field="thinkTime">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Pacing Strategy</label>
                                <select 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    data-script="${script.name}"
                                    data-field="pacingStrategy">
                                    <option value="fixed" ${script.pacingStrategy === 'fixed' ? 'selected' : ''}>Fixed</option>
                                    <option value="random" ${script.pacingStrategy === 'random' ? 'selected' : ''}>Random</option>
                                    <option value="dynamic" ${script.pacingStrategy === 'dynamic' ? 'selected' : ''}>Dynamic</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async saveWorkloadChanges() {
        try {
            const formData = this.collectFormData();
            await this.validateWorkloadChanges(formData);
            
            await this.dashboardManager.dataStore.updatePlannedWorkload(formData);
            this.hideEditModal();
            this.load(); // Reload the tab data
            this.dashboardManager.showSuccess('Workload updated successfully');
        } catch (error) {
            console.error('Error saving workload changes:', error);
            this.dashboardManager.showError('Failed to save changes: ' + error.message);
        }
    }

    collectFormData() {
        const form = document.getElementById('editWorkloadForm');
        const data = {
            scripts: []
        };

        // Group inputs by script
        const scripts = new Map();
        form.querySelectorAll('input, select').forEach(input => {
            const { script, field } = input.dataset;
            if (!scripts.has(script)) {
                scripts.set(script, {});
            }
            scripts.get(script)[field] = input.value;
        });

        // Convert to array
        scripts.forEach((values, scriptName) => {
            data.scripts.push({
                name: scriptName,
                ...values
            });
        });

        return data;
    }

    async validateWorkloadChanges(formData) {
        const validationResults = await this.dashboardManager.dataStore.validateWorkload(formData);
        
        if (validationResults.warnings.length > 0) {
            const proceed = await this.showWarningConfirmation(validationResults.warnings);
            if (!proceed) {
                throw new Error('Validation cancelled by user');
            }
        }

        if (validationResults.errors.length > 0) {
            throw new Error(validationResults.errors.join('\n'));
        }
    }

    async exportWorkload() {
        try {
            const format = await this.showExportFormatDialog();
            await this.dashboardManager.dataStore.exportWorkload(format);
            this.dashboardManager.showSuccess('Workload exported successfully');
        } catch (error) {
            console.error('Error exporting workload:', error);
            this.dashboardManager.showError('Failed to export workload');
        }
    }

    // Chart Configurations
    getScriptDistributionConfig() {
        return {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.5)',
                        'rgba(16, 185, 129, 0.5)',
                        'rgba(239, 68, 68, 0.5)',
                        'rgba(245, 158, 11, 0.5)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        };
    }

    getVUserDistributionConfig() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'VUsers',
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

    // Utility Methods
    generatePacingDistributionBars(distribution) {
        return distribution.map(segment => `
            <div class="h-full bg-blue-500" style="width: ${segment.percentage}%"></div>
        `).join('');
    }

    getResourceWarningClass(level) {
        const classes = {
            high: 'text-red-600',
            medium: 'text-yellow-600',
            low: 'text-green-600'
        };
        return classes[level] || 'text-gray-600';
    }

    getResourceWarningMessage(resources) {
        if (resources.warningLevel === 'high') {
            return 'Warning: Resource requirements exceed recommended limits';
        } else if (resources.warningLevel === 'medium') {
            return 'Note: Resource usage approaching recommended limits';
        }
        return 'Resource requirements within acceptable range';
    }
}
