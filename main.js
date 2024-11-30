import { DashboardManager } from './dashboard/DashboardManager.js';

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create instance of dashboard manager
    window.dashboardManager = new DashboardManager();
    
    // Handle global error catching
    window.onerror = (msg, url, line) => {
        console.error('Global error:', msg, 'at', url, 'line', line);
        window.dashboardManager.showError('An unexpected error occurred. Please try again.');
    };

    // Handle unhandled promise rejections
    window.onunhandledrejection = (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        window.dashboardManager.showError('An unexpected error occurred. Please try again.');
    };
});

// Handle service worker if needed
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.error('ServiceWorker registration failed:', error);
    });
}