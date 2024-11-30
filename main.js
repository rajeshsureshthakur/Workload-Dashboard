import { DashboardManager } from './dashboard/DashboardManager.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.dashboardManager = new DashboardManager();
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});
