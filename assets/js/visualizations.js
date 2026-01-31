// Portfolio Visualizations - Real data from projects
// Tobin Zolkowski

// Color palette matching site design
const colors = {
    accent: '#c9a227',
    accentLight: 'rgba(201, 162, 39, 0.7)',
    accentFaded: 'rgba(201, 162, 39, 0.2)',
    text: '#e8e4df',
    textDim: '#888',
    bg: '#0a0a0a',
    grid: 'rgba(255, 255, 255, 0.05)',
    green: '#2ecc71',
    red: '#e74c3c',
    blue: '#3498db',
    purple: '#9b59b6',
    orange: '#e67e22'
};

// Chart.js global defaults will be set inside DOMContentLoaded

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Chart is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    // Chart.js global defaults
    Chart.defaults.color = colors.textDim;
    Chart.defaults.font.family = "'Space Mono', monospace";
    Chart.defaults.font.size = 10;

    // Direct initialization (removing observer to ensure visibility)
    initChart('model-comparison-chart');
    initChart('feature-importance-chart');
    initChart('accident-map-chart');
    initChart('population-chart');
});

function initChart(chartId) {
    switch(chartId) {
        case 'model-comparison-chart':
            createModelComparisonChart();
            break;
        case 'feature-importance-chart':
            createFeatureImportanceChart();
            break;
        case 'accident-map-chart':
            createAccidentChart();
            break;
        case 'population-chart':
            createPopulationChart();
            break;
    }
}

// Chart 1: Model Performance Comparison (Employee Churn)
// Data source: Salifort Motors Project
function createModelComparisonChart() {
    const ctx = document.getElementById('model-comparison-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Logistic Regression', 'Random Forest', 'XGBoost'],
            datasets: [
                {
                    label: 'Accuracy',
                    data: [83, 97.83, 97.96],
                    backgroundColor: colors.accentFaded,
                    borderColor: colors.accent,
                    borderWidth: 1
                },
                {
                    label: 'Precision',
                    data: [50, 98, 98],
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: colors.green,
                    borderWidth: 1
                },
                {
                    label: 'Recall',
                    data: [17, 89, 90],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: colors.blue,
                    borderWidth: 1
                },
                {
                    label: 'F1-Score',
                    data: [26, 93, 94],
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    borderColor: colors.purple,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw}%`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        callback: (value) => value + '%'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Chart 2: Feature Importance (Employee Churn)
// Data source: XGBoost model from Salifort Motors Project
function createFeatureImportanceChart() {
    const ctx = document.getElementById('feature-importance-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Number of Projects',
                'Satisfaction Level', 
                'Tenure (Years)',
                'Avg Monthly Hours',
                'Last Evaluation',
                'Work Accident',
                'Promotion (5yr)',
                'Salary Level'
            ],
            datasets: [{
                data: [0.21, 0.20, 0.18, 0.15, 0.12, 0.06, 0.05, 0.03],
                backgroundColor: [
                    colors.accent,
                    colors.accentLight,
                    'rgba(201, 162, 39, 0.6)',
                    'rgba(201, 162, 39, 0.5)',
                    'rgba(201, 162, 39, 0.4)',
                    'rgba(201, 162, 39, 0.3)',
                    'rgba(201, 162, 39, 0.25)',
                    'rgba(201, 162, 39, 0.2)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `Importance: ${(context.raw * 100).toFixed(0)}%`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 0.25,
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        callback: (value) => (value * 100) + '%'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Chart 3: US Traffic Accidents by State (Top 10)
// Data source: 7.7M records, US Accidents Analysis
function createAccidentChart() {
    const ctx = document.getElementById('accident-map-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['CA', 'FL', 'TX', 'SC', 'NC', 'NY', 'PA', 'VA', 'GA', 'OR'],
            datasets: [{
                label: 'Accidents (thousands)',
                data: [1890, 890, 580, 320, 310, 290, 280, 270, 250, 230],
                backgroundColor: (context) => {
                    const value = context.raw;
                    if (value > 1000) return colors.accent;
                    if (value > 500) return colors.accentLight;
                    return 'rgba(201, 162, 39, 0.4)';
                },
                borderWidth: 0
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
                    callbacks: {
                        label: (context) => `${context.raw.toLocaleString()}k accidents`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        callback: (value) => value + 'k'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Chart 4: Global Population - Top 10 Nations Over Time
// Data source: World Bank via Global Population Insights
function createPopulationChart() {
    const ctx = document.getElementById('population-chart');
    if (!ctx) return;
    
    const years = ['1960', '1980', '2000', '2020', '2023'];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'China',
                    data: [667, 981, 1263, 1411, 1426],
                    borderColor: colors.accent,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'India',
                    data: [450, 697, 1057, 1380, 1428],
                    borderColor: colors.green,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'USA',
                    data: [180, 227, 282, 331, 335],
                    borderColor: colors.blue,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'Indonesia',
                    data: [88, 148, 212, 271, 277],
                    borderColor: colors.purple,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'Nigeria',
                    data: [45, 73, 122, 206, 224],
                    borderColor: colors.orange,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw}M`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        callback: (value) => value + 'M'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
