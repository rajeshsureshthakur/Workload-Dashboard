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

    createTabContent() {
        const content = document.createElement('div');
        content.id = 'designTab';
        content.className = 'tab-content hidden';
        
        content.innerHTML = `
            <!-- File Upload Section -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <h3 class="text-lg font-semibold mb-4">Upload Analysis Files</h3>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Historical Results File</label>
                        <div class="mt-1 flex items-center">
                            <input type="file" id="historicalFile" accept=".xlsx" 
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        <p class="mt-1 text-sm text-gray-500">Upload Excel file containing historical test results</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Transaction Configuration File</label>
                        <div class="mt-1 flex items-center">
                            <input type="file" id="configFile" accept=".xlsx"
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        <p class="mt-1 text-sm text-gray-500">Upload Excel file containing transaction configurations</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Target TPH File</label>
                        <div class="mt-1 flex items-center">
                            <input type="file" id="tphFile" accept=".xlsx"
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        <p class="mt-1 text-sm text-gray-500">Upload Excel file containing target TPH values</p>
                    </div>

                    <div class="flex justify-end">
                        <button id="analyzeBtn" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Analyze Workload
                        </button>
                    </div>
                </div>
            </div>

            <!-- Analysis Results Section (Initially Hidden) -->
            <div id="analysisResults" class="hidden">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-gray-500 text-sm">Total Scripts</h3>
                        <p class="text-3xl font-bold mt-2" id="totalScripts">-</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-gray-500 text-sm">Total VUsers</h3>
                        <p class="text-3xl font-bold mt-2" id="totalVUsers">-</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-gray-500 text-sm">Estimated Peak TPH</h3>
                        <p class="text-3xl font-bold mt-2" id="estimatedTPH">-</p>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold mb-4">VUser Distribution</h3>
                        <canvas id="vuserDistChart"></canvas>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold mb-4">Response Time Analysis</h3>
                        <canvas id="rtAnalysisChart"></canvas>
                    </div>
                </div>

                <!-- Detailed Results Table -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Workload Details</h3>
                        <button id="exportAnalysisBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Export Analysis
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Script Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target TPH</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended VUsers</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected RT</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody id="analysisTableBody" class="bg-white divide-y divide-gray-200">
                                <!-- Will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Recommendations Section -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Recommendations</h3>
                    <div id="recommendationsContainer" class="space-y-4">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    async load() {
        this.setupEventListeners();
        this.initializeCharts();
        
        // If there are previous analysis results, show them
        if (this.analysisResults) {
            this.showAnalysisResults(this.analysisResults);
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

// Continuing DesignWorkloadTab class...

    displayAnalysisResults(results) {
        const container = document.getElementById('analysisResults');
        container.classList.remove('hidden');
        
        container.innerHTML = `
            <!-- Analysis Results Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Workload Summary -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Workload Summary</h3>
                    <div class="space-y-4" id="workloadSummary">
                        ${this.generateWorkloadSummaryHTML(results.summary)}
                    </div>
                </div>

                <!-- VUser Distribution -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Recommended VUser Distribution</h3>
                    <canvas id="vuserDistChart"></canvas>
                </div>
            </div>

            <!-- Script Details Table -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <h3 class="text-lg font-semibold mb-4">Script-wise Recommendations</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Script Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target TPH</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended VUsers</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected RT (95th)</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.generateScriptDetailsRows(results.scriptDetails)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Optimization Recommendations -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Optimization Recommendations</h3>
                <div class="space-y-4" id="optimizationRecs">
                    ${this.generateRecommendationsHTML(results.recommendations)}
                </div>
            </div>

            <!-- Export Section -->
            <div class="mt-8 flex justify-end space-x-4">
                <button id="exportExcelBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Export to Excel
                </button>
                <button id="saveAnalysisBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Save Analysis
                </button>
            </div>
        `;

        // Initialize VUser Distribution Chart
        this.initializeVUserChart(results.vuserDistribution);
        this.setupExportListeners();
    }

    generateWorkloadSummaryHTML(summary) {
        return `
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Scripts:</span>
                <span class="font-semibold">${summary.totalScripts}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Total VUsers:</span>
                <span class="font-semibold">${summary.totalVUsers}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Expected Peak TPH:</span>
                <span class="font-semibold">${summary.peakTPH}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Estimated Load Level:</span>
                <span class="font-semibold ${this.getLoadLevelClass(summary.loadLevel)}">
                    ${summary.loadLevel}
                </span>
            </div>
        `;
    }

    generateScriptDetailsRows(scriptDetails) {
        return scriptDetails.map(script => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${script.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${script.targetTPH}</td>
                <td class="px-6 py-4 whitespace-nowrap">${script.recommendedVUsers}</td>
                <td class="px-6 py-4 whitespace-nowrap">${script.expectedRT}s</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${this.getRiskLevelClass(script.riskLevel)}">
                        ${script.riskLevel}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    generateRecommendationsHTML(recommendations) {
        return recommendations.map(rec => `
            <div class="p-4 rounded-lg ${this.getRecommendationClass(rec.type)}">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        ${this.getRecommendationIcon(rec.type)}
                    </div>
                    <div class="ml-3">
                        <h4 class="text-sm font-medium">${rec.title}</h4>
                        <p class="text-sm mt-1">${rec.description}</p>
                        ${rec.details ? `<ul class="list-disc list-inside mt-2 text-sm">
                            ${rec.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    initializeVUserChart(distribution) {
        const ctx = document.getElementById('vuserDistChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: distribution.labels,
                datasets: [{
                    label: 'Recommended VUsers',
                    data: distribution.values,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
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
        });
    }

    setupExportListeners() {
        document.getElementById('exportExcelBtn').addEventListener('click', () => this.exportToExcel());
        document.getElementById('saveAnalysisBtn').addEventListener('click', () => this.saveAnalysis());
    }

    async exportToExcel() {
        try {
            await this.dashboardManager.dataStore.exportAnalysis();
            this.showSuccess('Analysis exported successfully');
        } catch (error) {
            this.showError('Failed to export analysis');
        }
    }

    async saveAnalysis() {
        try {
            await this.dashboardManager.dataStore.saveCurrentAnalysis();
            this.showSuccess('Analysis saved successfully');
        } catch (error) {
            this.showError('Failed to save analysis');
        }
    }

    // Utility methods for styling
    getLoadLevelClass(level) {
        const classes = {
            'High': 'text-red-600',
            'Medium': 'text-yellow-600',
            'Low': 'text-green-600'
        };
        return classes[level] || 'text-gray-600';
    }

    getRiskLevelClass(level) {
        const classes = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return classes[level] || 'bg-gray-100 text-gray-800';
    }

    getRecommendationClass(type) {
        const classes = {
            'warning': 'bg-yellow-50 text-yellow-800',
            'error': 'bg-red-50 text-red-800',
            'info': 'bg-blue-50 text-blue-800'
        };
        return classes[type] || 'bg-gray-50 text-gray-800';
    }

    showSuccess(message) {
        // Implementation of success notification
        console.log('Success:', message);
    }

    showError(message) {
        // Implementation of error notification
        console.error('Error:', message);
    }
}

	