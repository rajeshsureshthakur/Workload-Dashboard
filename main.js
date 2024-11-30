import { DashboardManager } from './dashboard/DashboardManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded');
    
    // Verify important elements exist
    ['mainContent', 'homeTab', 'currentTab', 'designTab', 'plannedTab', 'slaTab', 'historicalTab'].forEach(id => {
        const element = document.getElementById(id);
        console.log(`Element ${id} exists:`, !!element);
    });

    try {
        window.dashboardManager = new DashboardManager();
        console.log('Dashboard manager initialized');
        
        // Check content after a short delay
        setTimeout(() => {
            ['homeTab', 'currentTab', 'designTab', 'plannedTab', 'slaTab', 'historicalTab'].forEach(id => {
                const element = document.getElementById(id);
                console.log(`${id} content:`, element?.innerHTML);
            });
        }, 2000);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});
