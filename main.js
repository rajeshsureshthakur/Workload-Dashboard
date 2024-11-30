import { DashboardManager } from './dashboard/DashboardManager.js';

const debugPanel = document.getElementById('debugPanel');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        debugPanel.textContent = 'Initializing Dashboard...';
        window.dashboardManager = new DashboardManager();
        debugPanel.textContent = 'Dashboard Initialized Successfully';
    } catch (error) {
        console.error('Initialization error:', error);
        debugPanel.textContent = `Error: ${error.message}`;
    }
});
