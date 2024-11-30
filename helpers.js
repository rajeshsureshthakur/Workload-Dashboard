// Excel file reading and processing
export async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // In a real implementation, you would use a library like SheetJS
                // to parse Excel files. This is a placeholder.
                resolve(e.target.result);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
}

export async function processExcelData(data) {
    // Placeholder for Excel data processing
    return {
        summary: {
            totalScripts: 0,
            totalVUsers: 0,
            estimatedTPH: 0
        },
        details: [],
        recommendations: []
    };
}

// Date and time formatting
export function formatDateTime(date) {
    return new Date(date).toLocaleString();
}

export function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}:${minutes % 60}:${seconds % 60}`;
}

// Data analysis utilities
export function calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
}

export function calculateAverage(values) {
    return values.reduce((acc, val) => acc + val, 0) / values.length;
}

export function calculateStandardDeviation(values) {
    const avg = calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = calculateAverage(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

// Chart utilities
export function getChartColors(count) {
    const baseColors = [
        'rgb(59, 130, 246)', // Blue
        'rgb(16, 185, 129)', // Green
        'rgb(239, 68, 68)',  // Red
        'rgb(245, 158, 11)', // Yellow
        'rgb(139, 92, 246)'  // Purple
    ];

    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

export function getTransparentColors(colors, opacity = 0.5) {
    return colors.map(color => color.replace('rgb', 'rgba').replace(')', `, ${opacity})`));
}

// DOM utilities
export function createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

// Validation utilities
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateNumber(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && (min === undefined || num >= min) && (max === undefined || num <= max);
}

// Error handling
export function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    // You could add additional error handling logic here
    throw error;
}

// Local storage utilities
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

export function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// File handling utilities
export function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}