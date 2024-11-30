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
            this.showLoading();
            // ... existing load logic ...
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
            const loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            `;
            tabContent.appendChild(loader);
        }
    }

     hideLoading() {
        const tabContent = document.getElementById(`${this.tabId}Tab`);
        if (tabContent) {
            const loader = tabContent.querySelector('.loading-overlay');
            if (loader) {
                loader.remove();
            }
        }
    }
}
