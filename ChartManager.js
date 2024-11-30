export class ChartManager {
    constructor() {
        this.charts = {};
        this.chartDefaults = {
            responsive: true,
            maintainAspectRatio: false
        };
    }

    initializeCharts(containerId) {
        // Initialize dashboard charts
        this.charts.performance = this.createPerformanceChart(
            document.getElementById('performanceChart')
        );
        
        this.charts.responseTime = this.createResponseTimeChart(
            document.getElementById('responseTimeChart')
        );
        
        this.charts.throughput = this.createThroughputChart(
            document.getElementById('throughputChart')
        );
        
        this.charts.slaCompliance = this.createSLAComplianceChart(
            document.getElementById('slaComplianceChart')
        );
    }

    createPerformanceChart(canvas) {
        return new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Performance Index',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.1
                }]
            },
            options: {
                ...this.chartDefaults,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Performance Score'
                        }
                    }
                }
            }
        });
    }

    createResponseTimeChart(canvas) {
        return new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '95th Percentile Response Time',
                    data: [],
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.1
                }]
            },
            options: {
                ...this.chartDefaults,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (s)'
                        }
                    }
                }
            }
        });
    }

    createThroughputChart(canvas) {
        return new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Transactions Per Hour',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)'
                }]
            },
            options: {
                ...this.chartDefaults,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'TPH'
                        }
                    }
                }
            }
        });
    }

    createSLAComplianceChart(canvas) {
        return new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Compliant', 'Non-Compliant'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        'rgb(16, 185, 129)',
                        'rgb(239, 68, 68)'
                    ]
                }]
            },
            options: {
                ...this.chartDefaults,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts(data) {
        this.updatePerformanceChart(data.performance);
        this.updateResponseTimeChart(data.responseTime);
        this.updateThroughputChart(data.throughput);
        this.updateSLAComplianceChart(data.slaCompliance);
    }

    updatePerformanceChart(data) {
        const chart = this.charts.performance;
        if (chart && data) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.values;
            chart.update();
        }
    }

    updateResponseTimeChart(data) {
        const chart = this.charts.responseTime;
        if (chart && data) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.values;
            chart.update();
        }
    }

    updateThroughputChart(data) {
        const chart = this.charts.throughput;
        if (chart && data) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.values;
            chart.update();
        }
    }

    updateSLAComplianceChart(data) {
        const chart = this.charts.slaCompliance;
        if (chart && data) {
            chart.data.datasets[0].data = [
                data.compliant,
                data.nonCompliant
            ];
            chart.update();
        }
    }

    createCustomChart(canvas, config) {
        return new Chart(canvas.getContext('2d'), {
            ...config,
            options: {
                ...this.chartDefaults,
                ...config.options
            }
        });
    }

    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }

    // Utility methods for chart formatting
    formatTooltip(tooltipItems) {
        return tooltipItems.map(item => ({
            ...item,
            value: this.formatNumber(item.value)
        }));
    }

    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    }

    getChartColors(count) {
        const colors = [
            'rgb(59, 130, 246)',   // Blue
            'rgb(16, 185, 129)',   // Green
            'rgb(239, 68, 68)',    // Red
            'rgb(245, 158, 11)',   // Yellow
            'rgb(139, 92, 246)',   // Purple
            'rgb(14, 165, 233)',   // Light Blue
            'rgb(249, 115, 22)',   // Orange
            'rgb(168, 85, 247)'    // Purple
        ];

        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    getChartBackgroundColors(count) {
        return this.getChartColors(count).map(color => {
            return color.replace('rgb', 'rgba').replace(')', ', 0.5)');
        });
    }
}