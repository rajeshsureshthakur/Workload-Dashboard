import { readExcelFile, processExcelData } from '../utils/helpers.js';

export class DataStore {
    constructor() {
        this.currentData = null;
        this.historicalData = [];
        this.configData = null;
        this.storageKey = 'loadrunner_analysis_';
    }

    async initialize() {
        try {
            // Initialize with dummy data for testing
            this.currentData = {
                summary: {
                    totalScripts: 5,
                    totalTPH: 1000,
                    totalVUsers: 100,
                    successRate: 98.5,
                    avgResponseTime: 2.3,
                    slaCompliance: 95.5
                },
                trends: {
                    dates: ['2024-01-01', '2024-01-02', '2024-01-03'],
                    tphData: [
                        { script: 'Script1', values: [800, 900, 1000] }
                    ],
                    rtData: [
                        { script: 'Script1', values: [1.5, 1.8, 1.6] }
                    ]
                },
                transactions: [
                    {
                        name: 'Transaction1',
                        scriptName: 'Script1',
                        responseTime95th: 1.5,
                        successRate: 99.5,
                        status: 'healthy'
                    }
                ]
            };
            
            return true;
        } catch (error) {
            console.error('Error initializing DataStore:', error);
            throw error;
        }
    }

     async getPlannedWorkload() {
        // Return dummy planned workload data
        return {
            summary: {
                totalTPH: 1500,
                totalVUsers: 100
            },
            scripts: [
                {
                    name: 'Script 1',
                    plannedTPH: 500,
                    requiredVUsers: 30,
                    pacing: 2.5,
                    thinkTime: 1.0,
                    status: 'optimal'
                },
                {
                    name: 'Script 2',
                    plannedTPH: 1000,
                    requiredVUsers: 70,
                    pacing: 3.0,
                    thinkTime: 1.5,
                    status: 'warning'
                }
            ],
            pacing: {
                strategyType: 'fixed',
                distribution: [
                    { percentage: 60 },
                    { percentage: 40 }
                ],
                description: 'Fixed pacing strategy with think time',
                recommendations: [
                    'Consider dynamic pacing for better resource utilization',
                    'Monitor response times during peak load'
                ]
            },
            resources: {
                totalVUsers: 100,
                estimatedMemory: 16,
                estimatedCPU: 8,
                estimatedBandwidth: 100,
                warningLevel: 'medium'
            }
        };
    }
    
    async getCurrentData() {
        // Return structured dummy data that matches what the tabs expect
        return {
            summary: {
                totalScripts: 5,
                totalTPH: 1500,
                successRate: 98.5,
                avgResponseTime: 2.3,
                totalVUsers: 100,
                slaCompliance: 95
            },
            transactions: [  // Add this array
                {
                    name: 'Transaction 1',
                    script: 'Script 1',
                    tph: 500,
                    responseTime: 1.8,
                    successRate: 99.5,
                    status: 'healthy'
                },
                {
                    name: 'Transaction 2',
                    script: 'Script 2',
                    tph: 750,
                    responseTime: 2.1,
                    successRate: 98.2,
                    status: 'warning'
                }
            ],
            trends: {
                labels: ['1h', '2h', '3h', '4h', '5h'],
                responseTimeSeries: [1.8, 1.9, 2.1, 1.9, 1.8],
                throughputSeries: [450, 500, 480, 520, 500]
            }
             planned: await this.getPlannedWorkload()
        };
    }
    

    async loadFromLocalStorage() {
        try {
            // Load historical data
            const historicalData = localStorage.getItem(`${this.storageKey}historical`);
            if (historicalData) {
                this.historicalData = JSON.parse(historicalData);
            }

            // Load configuration
            const configData = localStorage.getItem(`${this.storageKey}config`);
            if (configData) {
                this.configData = JSON.parse(configData);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            throw error;
        }
    }

    async loadFromFiles() {
        // This would typically load data from your local files
        // Implementation depends on your server setup
    }

    async processFiles(files) {
        try {
            const data = {
                historical: await readExcelFile(files.historical),
                config: await readExcelFile(files.config),
                tph: await readExcelFile(files.tph)
            };

            const processedData = await processExcelData(data);
            
            // Store current analysis
            this.currentData = processedData;
            
            // Add to historical data
            this.historicalData.push({
                date: new Date().toISOString(),
                data: processedData
            });

            // Save to local storage
            await this.saveToLocalStorage();
            
            return processedData;
        } catch (error) {
            console.error('Error processing files:', error);
            throw error;
        }
    }

    async saveToLocalStorage() {
        try {
            localStorage.setItem(
                `${this.storageKey}historical`,
                JSON.stringify(this.historicalData)
            );
            
            localStorage.setItem(
                `${this.storageKey}config`,
                JSON.stringify(this.configData)
            );
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw error;
        }
    }

    
    async getHistoricalData(filters = {}) {
        let filteredData = [...this.historicalData];

        if (filters.dateRange) {
            filteredData = this.filterByDateRange(filteredData, filters.dateRange);
        }

        if (filters.scripts && filters.scripts.length > 0) {
            filteredData = this.filterByScripts(filteredData, filters.scripts);
        }

        if (filters.status && filters.status !== 'all') {
            filteredData = this.filterByStatus(filteredData, filters.status);
        }

        return filteredData;
    }

    async getSLAMetrics() {
        return this.currentData?.slaMetrics || {};
    }

    async getPlannedWorkload() {
        return this.currentData?.plannedWorkload || {};
    }

    async updatePlannedWorkload(workloadData) {
        try {
            this.currentData.plannedWorkload = workloadData;
            await this.saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error updating planned workload:', error);
            throw error;
        }
    }

    async updateSLAConfig(slaConfig) {
        try {
            this.configData.sla = slaConfig;
            await this.saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error updating SLA config:', error);
            throw error;
        }
    }

    async exportData(format = 'excel') {
        // Implementation for exporting data
        // Would connect to backend service for file generation
    }

    // Helper methods for filtering
    filterByDateRange(data, range) {
        const now = new Date();
        let startDate;

        switch (range) {
            case '1week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '1month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case '3months':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '6months':
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            default:
                return data;
        }

        return data.filter(item => new Date(item.date) >= startDate);
    }

    filterByScripts(data, scripts) {
        return data.filter(item => 
            scripts.some(script => item.data.scriptName === script)
        );
    }

    filterByStatus(data, status) {
        return data.filter(item => item.data.status === status);
    }

    // Analysis methods
    calculateSummaryStats(data) {
        return {
            totalScripts: data.length,
            avgResponseTime: this.calculateAverage(data, 'responseTime'),
            avgThroughput: this.calculateAverage(data, 'throughput'),
            successRate: this.calculateSuccessRate(data)
        };
    }

    calculateAverage(data, field) {
        return data.reduce((acc, curr) => acc + curr[field], 0) / data.length;
    }

    calculateSuccessRate(data) {
        const totalSuccess = data.reduce((acc, curr) => acc + curr.successCount, 0);
        const totalTransactions = data.reduce((acc, curr) => acc + curr.totalCount, 0);
        return (totalSuccess / totalTransactions) * 100;
    }
}
