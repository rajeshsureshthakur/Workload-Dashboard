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

    createTabContent() {
        // To be implemented by child classes
        throw new Error('createTabContent must be implemented by child class');
    }

    async load() {
        try {
            console.log(`Loading ${this.tabId} tab`);
            this.showLoading();
            const data = await this.dashboardManager.dataStore.getCurrentData();
            console.log(`Data received for ${this.tabId}:`, data);
            
            // Ensure tab container exists
            let tabContainer = document.getElementById(`${this.tabId}Tab`);
            if (!tabContainer) {
                console.log(`Creating container for ${this.tabId}`);
                tabContainer = document.createElement('div');
                tabContainer.id = `${this.tabId}Tab`;
                tabContainer.className = 'tab-content hidden';
                document.getElementById('mainContent').appendChild(tabContainer);
            }

            // Update content
            this.updateContent(data);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error(`Error loading ${this.tabId} tab:`, error);
        }
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
            tabContent.innerHTML = `
                <div class="flex items-center justify-center h-64">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            `;
        }
    }

    hideLoading() {
        const loader = document.querySelector('.animate-spin')?.parentElement;
        if (loader) {
            loader.remove();
        }
    }
}
