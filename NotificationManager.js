export class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.remove('opacity-0'), 10);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('opacity-0');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `
            max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto 
            ring-1 ring-black ring-opacity-5 overflow-hidden transition-opacity duration-300 opacity-0
        `;

        const typeClasses = {
            success: 'text-green-500',
            error: 'text-red-500',
            warning: 'text-yellow-500',
            info: 'text-blue-500'
        };

        const icons = {
            success: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>`,
            error: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>`,
            warning: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>`,
            info: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>`
        };

        notification.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0 ${typeClasses[type]}">
                        ${icons[type]}
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm text-gray-900">${message}</p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="inline-flex text-gray-400 hover:text-gray-500">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add click handler to close button
        notification.querySelector('button').addEventListener('click', () => {
            notification.remove();
        });

        return notification;
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Create a singleton instance
export const notificationManager = new NotificationManager();