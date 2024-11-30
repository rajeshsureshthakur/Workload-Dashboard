import { BaseTab } from './BaseTab.js';

export class DesignWorkloadTab extends BaseTab {
    constructor(dashboardManager) {
        super(dashboardManager, 'design');
        this.uploadedFiles = {
            historical: null,
            config: null,
            tph: null
        };
        this.analysisResults = null;
    }

    update(data) {
        console.log('Updating Design Workload tab with data:', data);
        this.updateContent(data);
    }

     updateContent(data) {
        if (!data) return;
        
        // Update any dynamic content in the design tab
        if (this.analysisResults) {
            this.showAnalysisResults(this.analysisResults);
        }
    }

    
createTabContent() {
    return `
        <div class="space-y-6">
            <!-- File Upload Section -->
            <div class="tab-section">
                <h3 class="text-lg font-semibold mb-4">Upload Analysis Files</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Historical Results File</label>
                        <input type="file" id="historicalFile" accept=".xlsx" 
                            class="form-input mt-1 block w-full" />
                        <p class="mt-1 text-sm text-gray-500">Upload Excel file containing historical test results</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Transaction Configuration File</label>
                        <input type="file" id="configFile" accept=".xlsx"
                            class="form-input mt-1 block w-full" />
                        <p class="mt-1 text-sm text-gray-500">Upload Excel file containing transaction configurations</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Target TPH File</label>
                        <input type="file" id="tphFile" accept=".xlsx"
                            class="form-input mt-1 block w-full" />
                        <p class="mt-1 text-sm text-gray-500">Upload Excel file containing target TPH values</p>
                    </div>

                    <div class="flex justify-end">
                        <button id="analyzeBtn" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Analyze Workload
                        </button>
                    </div>
                </div>
            </div>

            <!-- Analysis Results Section -->
            <div id="analysisResults" class="hidden space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="tab-section">
                        <h3 class="text-gray-500 text-sm">Total Scripts</h3>
                        <p class="text-3xl font-bold mt-2" id="totalScriptsAnalysis">-</p>
                    </div>
                    <div class="tab-section">
                        <h3 class="text-gray-500 text-sm">Total VUsers</h3>
                        <p class="text-3xl font-bold mt-2" id="totalVUsersAnalysis">-</p>
                    </div>
                    <div class="tab-section">
                        <h3 class="text-gray-500 text-sm">Estimated Peak TPH</h3>
                        <p class="text-3xl font-bold mt-2" id="estimatedTPH">-</p>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="tab-section">
                        <h3 class="text-lg font-semibold mb-4">VUser Distribution</h3>
                        <canvas id="vuserDistChart"></canvas>
                    </div>
                    <div class="tab-section">
                        <h3 class="text-lg font-semibold mb-4">Response Time Analysis</h3>
                        <canvas id="rtAnalysisChart"></canvas>
                    </div>
                </div>

                <!-- Results Table -->
                <div class="tab-section">
                    <h3 class="text-lg font-semibold mb-4">Analysis Results</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Script Name</th>
                                <th>Target TPH</th>
                                <th>Recommended VUsers</th>
                                <th>Expected RT</th>
                                <th>Risk Level</th>
                            </tr>
                        </thead>
                        <tbody id="analysisTableBody">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

     async load() {
        try {
            console.log('Loading Design Workload tab');
            const content = this.createTabContent();
            const mainContent = document.getElementById('mainContent');
            
            // Check if tab content already exists
            const existingTab = document.getElementById('designTab');
            if (!existingTab) {
                mainContent.appendChild(content);
            }
            
            this.setupEventListeners();
            
            // Show existing analysis if available
            if (this.analysisResults) {
                this.showAnalysisResults(this.analysisResults);
            }
        } catch (error) {
            console.error('Error loading design workload:', error);
            this.dashboardManager.showError('Failed to load design workload');
        }
    }

    setupEventListeners() {
        // File upload listeners
        document.getElementById('historicalFile').addEventListener('change', (e) => this.handleFileUpload(e, 'historical'));
        document.getElementById('configFile').addEventListener('change', (e) => this.handleFileUpload(e, 'config'));
        document.getElementById('tphFile').addEventListener('change', (e) => this.handleFileUpload(e, 'tph'));

        // Analysis button listener
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeWorkload());

        // Export button listener
        document.getElementById('exportAnalysisBtn')?.addEventListener('click', () => this.exportAnalysis());
    }

    initializeCharts() {
        // Initialize VUser Distribution Chart
        this.charts.vuserDist = new Chart(
            document.getElementById('vuserDistChart')?.getContext('2d'),
            this.getVUserDistChartConfig()
        );

        // Initialize Response Time Analysis Chart
        this.charts.rtAnalysis = new Chart(
            document.getElementById('rtAnalysisChart')?.getContext('2d'),
            this.getRTAnalysisChartConfig()
        );
    }

    handleFileUpload(event, fileType) {
        const file = event.target.files[0];
        if (file) {
            this.uploadedFiles[fileType] = file;
            this.validateFiles();
        }
    }

    validateFiles() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const allFilesUploaded = Object.values(this.uploadedFiles).every(file => file !== null);
        analyzeBtn.disabled = !allFilesUploaded;
    }

    async analyzeWorkload() {
        try {
            this.showLoading();
            
            const data = await this.dashboardManager.dataStore.processFiles(this.uploadedFiles);
            this.analysisResults = data;
            this.showAnalysisResults(data);
            
            this.hideLoading();
            this.dashboardManager.showSuccess('Analysis completed successfully');
        } catch (error) {
            this.hideLoading();
            console.error('Analysis error:', error);
            this.dashboardManager.showError('Failed to analyze workload');
        }
    }

    showAnalysisResults(data) {
        document.getElementById('analysisResults').classList.remove('hidden');
        
        // Update summary cards
        this.updateSummaryCards(data.summary);
        
        // Update charts
        this.updateCharts(data);
        
        // Update detailed results table
        this.updateResultsTable(data.details);
        
        // Update recommendations
        this.updateRecommendations(data.recommendations);
    }

    updateSummaryCards(summary) {
        document.getElementById('totalScripts').textContent = summary.totalScripts;
        document.getElementById('totalVUsers').textContent = summary.totalVUsers;
        document.getElementById('estimatedTPH').textContent = this.formatNumber(summary.estimatedTPH);
    }

    updateCharts(data) {
        // Update VUser Distribution Chart
        this.charts.vuserDist.data.labels = data.vuserDistribution.labels;
        this.charts.vuserDist.data.datasets[0].data = data.vuserDistribution.values;
        this.charts.vuserDist.update();

        // Update Response Time Analysis Chart
        this.charts.rtAnalysis.data.labels = data.rtAnalysis.labels;
        this.charts.rtAnalysis.data.datasets[0].data = data.rtAnalysis.values;
        this.charts.rtAnalysis.update();
    }

    updateResultsTable(details) {
        const tbody = document.getElementById('analysisTableBody');
        tbody.innerHTML = '';

        details.forEach(detail => {
            const row = this.createResultRow(detail);
            tbody.appendChild(row);
        });
    }

    createResultRow(detail) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${detail.scriptName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${this.formatNumber(detail.targetTPH)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${detail.recommendedVUsers}</td>
            <td class="px-6 py-4 whitespace-nowrap">${detail.expectedRT}s</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${this.getRiskBadge(detail.riskLevel)}
            </td>
        `;
        return row;
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendationsContainer');
        container.innerHTML = recommendations.map(rec => this.createRecommendationElement(rec)).join('');
    }

    createRecommendationElement(recommendation) {
        return `
            <div class="p-4 rounded-lg ${this.getRecommendationClass(recommendation.type)}">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        ${this.getRecommendationIcon(recommendation.type)}
                    </div>
                    <div class="ml-3">
                        <h4 class="text-sm font-medium">${recommendation.title}</h4>
                        <p class="text-sm mt-1">${recommendation.description}</p>
                    </div>
                </div>
            </div>
        `;
    }

    async exportAnalysis() {
        try {
            await this.dashboardManager.exportData('analysis');
            this.dashboardManager.showSuccess('Analysis exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            this.dashboardManager.showError('Failed to export analysis');
        }
    }

    // Chart Configurations
    getVUserDistChartConfig() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Recommended VUsers',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of VUsers'
                        }
                    }
                }
            }
        };
    }

    getRTAnalysisChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Expected Response Time',
                    data: [],
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.1
                }]
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

    // Utility Methods
    getRiskBadge(level) {
        const classes = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[level]}">
                ${level.toUpperCase()}
            </span>
        `;
    }

    getRecommendationClass(type) {
        const classes = {
            warning: 'bg-yellow-50 text-yellow-800',
            danger: 'bg-red-50 text-red-800',
            info: 'bg-blue-50 text-blue-800'
        };
        return classes



    getRecommendationIcon(type) {
        const icons = {
            warning: `<svg class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`,
            danger: `<svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
            info: `<svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`
        };
        return icons[type] || icons.info;
    }

    showLoading() {
        // Implementation for showing loading state
    }

    hideLoading() {
        // Implementation for hiding loading state
    }

    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    }
}
