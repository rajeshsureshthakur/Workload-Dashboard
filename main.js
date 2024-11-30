import { DashboardManager } from './dashboard/DashboardManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing dashboard...');
        window.dashboardManager = new DashboardManager();
        
        // Debug: Check if initial data is loaded
        const data = await window.dashboardManager.dataStore.getCurrentData();
        console.log('Initial data:', data);
        
        // Debug: Try switching to home tab
        await window.dashboardManager.switchTab('home');
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
});
