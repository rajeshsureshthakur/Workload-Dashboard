import { DataStore } from '../data/DataStore.js';
import { ChartManager } from './ChartManager.js';
import { CurrentWorkloadTab } from '../tabs/CurrentWorkloadTab.js';
import { DesignWorkloadTab } from '../tabs/DesignWorkloadTab.js';
import { PlannedWorkloadTab } from '../tabs/PlannedWorkloadTab.js';
import { SLAMetricsTab } from '../tabs/SLAMetricsTab.js';
import { HistoricalWorkloadsTab } from '../tabs/HistoricalWorkloadsTab.js';

export class DashboardManager {
    constructor() {
        this.dataStore = new DataStore();
        this.chartManager = new ChartManager();
        this.currentTab = 'home';
        this.tabs = {};
        this.init();
    }

    async init() {
        try {
            await this.dataStore.initialize();
            this.setupTabs();
            this.setupEventListeners();
            this.loadInitialData();
            this.updateLastUpdated();
        } catch (error) {
            this.showError('Failed to initialize dashboard');
            console.error('Initialization error:', error);
        }
    }

    setupTabs() {
        this.tabs = {
            current: new CurrentWorkloadTab(this),
            design: new DesignWorkloadTab(this),
            planned: new PlannedWorkloadTab(this),
            sla: new SLAMetricsTab(this),
            historical: new HistoricalWorkloadsTab(this)
        };
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());

        // Global error handler for async operations
        window.addEventListener('unhandledrejection', event => {
            this.showError('An unexpected error occurred');
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    async loadInitialData() {
        try {
            const data = await this.dataStore.getCurrentData();
            this.updateDashboard(data);
        } catch (error) {
            this.showError('Failed to load initial data');
            console.error('Initial data load error:', error);
        }
    }

    async switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from nav items
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        if (this.tabs[tabName]) {
            const tabContent = document.getElementById(`${tabName}Tab`);
            if (tabContent) {
                tabContent.classList.add('active');
                document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
                this.currentTab = tabName;
                
                // Update page title
                document.getElementById('currentPageTitle').textContent = 
                    this.getTabTitle(tabName);

                // Load tab-specific data
                await this.tabs[tabName].load();
            }
        }
    }

    async refreshData() {
        try {
            const data = await this.dataStore.getCurrentData();
            this.updateDashboard(data);
            this.updateLastUpdated();
            this.showSuccess('Data refreshed successfully');
        } catch (error) {
            this.showError('Failed to refresh data');
            console.error('Refresh error:', error);
        }
    }

    updateDashboard(data) {
        // Update summary metrics
        this.updateSummaryMetrics(data.summary);

        // Update charts
        this.chartManager.updateCharts(data);

        // Update current tab
        if (this.tabs[this.currentTab]) {
            this.tabs[this.currentTab].update(data);
        }
    }

    updateSummaryMetrics(summary) {
        // Update summary cards
        Object.entries(summary).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (typeof value === 'number') {
                    element.textContent = this.formatNumber(value);
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    updateLastUpdated() {
        const element = document.getElementById('lastUpdated');
        if (element) {
            element.textContent = new Date().toLocaleString();
        }
    }

    getTabTitle(tabName) {
        const titles = {
            home: 'Dashboard Overview',
            current: 'Current Workload Analysis',
            design: 'Design New Workload',
            planned: 'Planned Workload Details',
            sla: 'SLA Metrics',
            historical: 'Historical Workloads'
        };
        return titles[tabName] || 'Dashboard';
    }

    showError(message) {
        // Implementation depends on your preferred notification system
        console.error(message);
        // Example using alert (replace with proper notification system)
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // Implementation depends on your preferred notification system
        console.log(message);
        // Example using alert (replace with proper notification system)
        alert(`Success: ${message}`);
    }

    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    }

    // Export functionality
    async exportData(format = 'excel') {
        try {
            await this.dataStore.exportData(format);
            this.showSuccess('Data exported successfully');
        } catch (error) {
            this.showError('Failed to export data');
            console.error('Export error:', error);
        }
    }
}