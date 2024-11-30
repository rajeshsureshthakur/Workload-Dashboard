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
            await this.loadInitialData();
            this.updateLastUpdated();
            
            // Switch to home tab by default
            await this.switchTab('home');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    async loadInitialData() {
        try {
            const data = await this.dataStore.getCurrentData();
            console.log('Initial data loaded:', data);
            this.updateDashboard(data);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load initial data');
        }
    }

    setupTabs() {
        // Initialize tab instances
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
            tab.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabName = e.target.getAttribute('data-tab');
                await this.switchTab(tabName);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    async switchTab(tabName) {
    console.log('Switching to tab:', tabName);

    try {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            if(tab.id !== 'homeTab') { // Don't hide home tab when it's selected
                tab.classList.add('hidden');
            }
        });

        // Remove active class from all nav items
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab and load its content
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
            document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
            this.currentTab = tabName;
            document.getElementById('currentPageTitle').textContent = this.getTabTitle(tabName);

            if (tabName === 'home') {
                await this.loadInitialData();
            } else if (this.tabs[tabName]) {
                await this.tabs[tabName].load();
            }
        }
    } catch (error) {
        console.error('Error switching tab:', error);
    }
}

    updateDashboard(data) {
        console.log('Updating dashboard with data:', data);
        if (!data || !data.summary) return;

        // Update summary metrics
        this.updateSummaryMetrics(data.summary);

        // Update charts if available
        if (data.trends) {
            this.chartManager.updateCharts(data.trends);
        }

        // Update current tab
        if (this.tabs[this.currentTab]) {
            this.tabs[this.currentTab].update(data);
        }
    }

    updateSummaryMetrics(summary) {
        const metrics = {
            'totalScripts': summary.totalScripts || 0,
            'totalTPH': summary.totalTPH || 0,
            'successRate': summary.successRate || 0,
            'avgResponseTime': summary.avgResponseTime || 0
        };

        Object.entries(metrics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`Updating ${id} with value:`, value);
                if (id === 'successRate') {
                    element.textContent = `${value.toFixed(1)}%`;
                } else if (id === 'avgResponseTime') {
                    element.textContent = `${value.toFixed(2)}s`;
                } else {
                    element.textContent = value.toString();
                }
            } else {
                console.warn(`Element not found for ${id}`);
            }
        });
    }

    async refreshData() {
        try {
            const data = await this.dataStore.getCurrentData();
            this.updateDashboard(data);
            this.updateLastUpdated();
            console.log('Data refreshed successfully');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showError('Failed to refresh data');
        }
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
        console.error(message);
        // Add your error notification implementation here
    }

    showSuccess(message) {
        console.log(message);
        // Add your success notification implementation here
    }
}
