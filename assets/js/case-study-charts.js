// Case Study Visualizations - Traffic Accident Analytics
// Data derived from 7.7M record analysis

const colors = {
    accent: '#c9a227',
    accentLight: 'rgba(201, 162, 39, 0.7)',
    accentFaded: 'rgba(201, 162, 39, 0.2)',
    text: '#e8e4df',
    textDim: '#888',
    grid: 'rgba(255, 255, 255, 0.05)',
    green: '#2ecc71',
    blue: '#3498db',
    red: '#e74c3c'
};

// Chart.js global defaults will be set inside DOMContentLoaded

document.addEventListener('DOMContentLoaded', () => {
    // Ensure Chart is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    Chart.defaults.color = colors.textDim;
    Chart.defaults.font.family = "'Space Mono', monospace";
    Chart.defaults.font.size = 11;

    createSeverityChart();
    createTemporalChart();
    createWeatherChart();
});

// Severity Distribution
function createSeverityChart() {
    const ctx = document.getElementById('severity-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Severity 1', 'Severity 2', 'Severity 3', 'Severity 4'],
            datasets: [{
                data: [2.1, 78.3, 18.2, 1.4],
                backgroundColor: [
                    'rgba(201, 162, 39, 0.3)',
                    colors.accent,
                    colors.accentLight,
                    colors.red
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw}%`
                    }
                }
            }
        }
    });
}

// Temporal Patterns (Hour of Day)
function createTemporalChart() {
    const ctx = document.getElementById('temporal-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
            datasets: [
                {
                    label: 'Weekday',
                    data: [2.1, 1.2, 5.8, 9.2, 7.4, 8.9, 10.1, 4.8],
                    borderColor: colors.accent,
                    backgroundColor: colors.accentFaded,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Weekend',
                    data: [3.2, 2.1, 2.4, 4.1, 5.8, 6.2, 5.9, 4.1],
                    borderColor: colors.blue,
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw}%`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: colors.grid },
                    ticks: { callback: (v) => v + '%' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// Weather Impact
function createWeatherChart() {
    const ctx = document.getElementById('weather-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Clear', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Snow', 'Fog'],
            datasets: [
                {
                    label: 'Accident Rate',
                    data: [42, 28, 18, 5, 4, 3],
                    backgroundColor: colors.accentFaded,
                    borderColor: colors.accent,
                    borderWidth: 1
                },
                {
                    label: 'Avg Severity',
                    data: [2.1, 2.2, 2.3, 2.8, 2.6, 2.9],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: colors.red,
                    borderWidth: 1,
                    yAxisID: 'severity'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    grid: { color: colors.grid },
                    ticks: { callback: (v) => v + '%' },
                    title: { display: true, text: 'Accident Rate %' }
                },
                severity: {
                    beginAtZero: true,
                    max: 4,
                    position: 'right',
                    grid: { display: false },
                    title: { display: true, text: 'Severity (1-4)' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}
