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
        // To be implemented by child classes
        throw new Error('load must be implemented by child class');
    }

    update(data) {
        // To be implemented by child classes
        throw new Error('update must be implemented by child class');
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

    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="mt-2">Loading...</p>
        `;
        document.getElementById(this.tabId).appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
}