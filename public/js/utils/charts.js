// Chart Utilities using Chart.js
const ChartUtils = {
    // Helper to get theme colors
    getThemeColors() {
        const isDark = document.documentElement.classList.contains('dark');
        return {
            textColor: isDark ? '#9ca3af' : '#4b5563', // gray-400 : gray-600
            gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderColor: isDark ? '#1f2937' : '#ffffff' // gray-800 : white
        };
    },

    // Create a bar chart
    createBarChart(canvasId, labels, data, label = 'Ventas') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const theme = this.getThemeColors();

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        borderColor: 'rgba(16, 185, 129, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: theme.textColor,
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: theme.gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: theme.textColor
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Create a pie/doughnut chart
    createPieChart(canvasId, labels, data, title = 'Distribución') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const theme = this.getThemeColors();

        const colors = [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(251, 146, 60, 0.8)'
        ];

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: theme.borderColor,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: theme.textColor,
                            padding: 15,
                            font: {
                                size: 12
                            },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Update chart data
    updateChart(chart, labels, data) {
        if (!chart) return;

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    },

    // Destroy chart
    destroyChart(chart) {
        if (chart) {
            chart.destroy();
        }
    }
};
