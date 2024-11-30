export class DataFormatter {
    static formatNumber(number, options = {}) {
        const {
            minimumFractionDigits = 0,
            maximumFractionDigits = 2,
            style = 'decimal'
        } = options;

        return new Intl.NumberFormat('en-US', {
            style,
            minimumFractionDigits,
            maximumFractionDigits,
            ...options
        }).format(number);
    }

    static formatPercentage(number, decimals = 1) {
        return this.formatNumber(number, {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    static formatDateTime(date, options = {}) {
        const {
            format = 'full',
            timezone = undefined
        } = options;

        const dateObj = new Date(date);

        const formats = {
            full: { dateStyle: 'full', timeStyle: 'long' },
            long: { dateStyle: 'long', timeStyle: 'short' },
            medium: { dateStyle: 'medium', timeStyle: 'short' },
            short: { dateStyle: 'short', timeStyle: 'short' },
            date: { dateStyle: 'medium' },
            time: { timeStyle: 'medium' }
        };

        return new Intl.DateTimeFormat('en-US', {
            ...formats[format],
            timeZone: timezone
        }).format(dateObj);
    }

    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${this.formatNumber(size, { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
    }

    static formatResponseTime(milliseconds) {
        if (milliseconds < 1000) {
            return `${Math.round(milliseconds)} ms`;
        } else {
            return `${(milliseconds / 1000).toFixed(2)} s`;
        }
    }

    static formatThroughput(tph) {
        if (tph >= 1000000) {
            return `${(tph / 1000000).toFixed(2)}M TPH`;
        } else if (tph >= 1000) {
            return `${(tph / 1000).toFixed(2)}K TPH`;
        } else {
            return `${Math.round(tph)} TPH`;
        }
    }
}