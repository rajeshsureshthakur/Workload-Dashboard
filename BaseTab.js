export class BaseTab {
    constructor(dashboardManager, tabId) {
        this.dashboardManager = dashboardManager;
        this.tabId = tabId;
        this.charts = {};
    }

    async initialize() {
        const content = this.createTabContent();
        document.getElementById('mainContent').appendChild(content);
    }

     async initializeComponents() {
        try {
            await this.setupEventListeners();
            await this.initializeCharts();
        } catch (error) {
            console.error(`Error initializing components for ${this.tabId}:`, error);
        }
    }

    

   createTabContent() {
        throw new Error('createTabContent must be implemented by child class');
    }

   async load() {
        try {
            console.log(`Loading ${this.tabId} tab`);
            
            // Get or create the tab container
            let tabContainer = document.getElementById(`${this.tabId}Tab`);
            if (!tabContainer) {
                console.log(`Creating container for ${this.tabId}`);
                const mainContent = document.getElementById('mainContent');
                if (!mainContent) {
                    throw new Error('Main content container not found');
                }

                tabContainer = document.createElement('div');
                tabContainer.id = `${this.tabId}Tab`;
                tabContainer.className = 'tab-content hidden';
                tabContainer.innerHTML = this.createTabContent();
                mainContent.appendChild(tabContainer);
            }

            // Initialize components
            await this.initializeComponents();
            
            // Load and update data
            const data = await this.dashboardManager.dataStore.getCurrentData();
            this.updateContent(data);

        } catch (error) {
            console.error(`Error loading ${this.tabId} tab:`, error);
            throw error;
        }
    }


    updateContent(data) {
        // To be implemented by child classes
        console.log(`Updating content for ${this.tabId} with data:`, data);
    }


    update(data) {
        try {
            this.updateContent(data);
        } catch (error) {
            console.error(`Error updating ${this.tabId} tab:`, error);
        }
    }

    destroy() {
        // Cleanup resources
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

     setupEventListeners() {
        // To be implemented by child classes if needed
    }

    initializeCharts() {
        // To be implemented by child classes if needed
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // Utility methods that can be used by all tabs
    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    }

    formatDate(date) {
        return new Date(date).toLocaleString();
    }

    getStatusBadge(status) {
        const classes = {
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800'
        };

        return `
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${classes[status]}">
                ${status.toUpperCase()}
            </span>
        `;
    }

    showError(message) {
        this.dashboardManager.showError(message);
    }

    showSuccess(message) {
        this.dashboardManager.showSuccess(message);
    }

    showLoading() {
        const tabContent = document.getElementById(`${this.tabId}Tab`);
        if (tabContent) {
            const loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = `
                <div class="flex items-center justify-center h-64">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            `;
            tabContent.appendChild(loader);
        }
    }

    hideLoading() {
        const loader = document.querySelector('.loading-overlay');
        if (loader) {
            loader.remove();
        }
    }
}
