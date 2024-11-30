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
            console.log('Initializing DashboardManager');
            await this.dataStore.initialize();
            this.setupTabs();
            this.setupEventListeners();
            await this.loadInitialData();
            this.updateLastUpdated();
            
            // Explicitly switch to home tab after initialization
            await this.switchTab('home');
            console.log('Initialization complete');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

   async setupTabs() {
        // Create instances of all tabs
        this.tabs = {
            current: new CurrentWorkloadTab(this),
            design: new DesignWorkloadTab(this),
            planned: new PlannedWorkloadTab(this),
            sla: new SLAMetricsTab(this),
            historical: new HistoricalWorkloadsTab(this)
        };

        // Initialize each tab's content
        for (const [tabName, tabInstance] of Object.entries(this.tabs)) {
            const tabContent = tabInstance.createTabContent();
            document.getElementById('mainContent').appendChild(tabContent);
        }
    }

   setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabName = e.target.getAttribute('data-tab');
                await this.switchTab(tabName);
            });
        });

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshData());
    }

    async loadInitialData() {
        try {
            const data = await this.dataStore.getCurrentData();
            console.log('Initial data loaded:', data); // Add this log
            this.updateDashboard(data);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load initial data');
        }
    }

  // DashboardManager.js
async switchTab(tabName) {
    console.log('Switching to tab:', tabName);

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all nav items
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const tabContent = document.getElementById(`${tabName}Tab`);
    if (tabContent) {
        tabContent.classList.remove('hidden');
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        this.currentTab = tabName;

        // Update page title
        document.getElementById('currentPageTitle').textContent = this.getTabTitle(tabName);

        // Load tab content if it hasn't been loaded
        if (this.tabs[tabName] && (!tabContent.innerHTML.trim() || tabContent.dataset.needsRefresh)) {
            await this.tabs[tabName].load();
            tabContent.dataset.needsRefresh = 'false';
        }
    }
}



   async refreshData() {
    try {
        console.log('Refreshing data...');
        const data = await this.dataStore.getCurrentData();
        this.updateDashboard(data);
        this.updateLastUpdated();
        console.log('Data refreshed successfully');
    } catch (error) {
        console.error('Refresh error:', error);
        this.showError('Failed to refresh data');
    }
}


   updateDashboard(data) {
        console.log('Updating dashboard with data:', data); // Add this log
        if (!data) {
            console.warn('No data provided to updateDashboard');
            return;
        }

        // Update summary metrics
        if (data.summary) {
            this.updateSummaryMetrics(data.summary);
        }

        // Update current tab
        if (this.tabs[this.currentTab]) {
            this.tabs[this.currentTab].update(data);
        }
    }

    updateSummaryMetrics(summary) {
    console.log('Updating summary metrics with:', summary);
    
    // Force create elements if they don't exist
    const metrics = {
        totalScripts: { value: summary.totalScripts || 0, label: 'Total Scripts' },
        totalTPH: { value: summary.totalTPH || 0, label: 'Total TPH' },
        successRate: { value: summary.successRate || 0, label: 'Success Rate' },
        avgResponseTime: { value: summary.avgResponseTime || 0, label: 'Avg Response Time' }
    };

    Object.entries(metrics).forEach(([key, data]) => {
        let element = document.getElementById(key);
        if (!element) {
            // Create the metric card if it doesn't exist
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <h3 class="text-gray-500 text-sm">${data.label}</h3>
                <p class="text-3xl font-bold mt-2" id="${key}">-</p>
            `;
            document.querySelector('.grid')?.appendChild(card);
            element = document.getElementById(key);
        }
        
        if (element) {
            const formattedValue = this.formatMetric(key, data.value);
            console.log(`Setting ${key} to:`, formattedValue);
            element.textContent = formattedValue;
            // Add debug outline
            element.parentElement.classList.add('debug-outline');
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

     formatMetric(key, value) {
        switch (key) {
            case 'successRate':
                return `${value.toFixed(1)}%`;
            case 'avgResponseTime':
                return `${value.toFixed(2)}s`;
            case 'totalTPH':
                return this.formatNumber(value);
            default:
                return value.toString();
        }
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
