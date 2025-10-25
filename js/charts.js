// NEW: Forecast Line Charts (Temperature, Humidity, Wind Speed)
let forecastTempChart, forecastHumidityChart, forecastWindChart;

// Create Temperature Forecast Chart
window.createForecastCharts = function(labels, temperatures, humidities, windSpeeds) {
    createForecastTempChart(labels, temperatures);
    createForecastHumidityChart(labels, humidities);
    createForecastWindChart(labels, windSpeeds);
};

// 1. Temperature Forecast Chart
function createForecastTempChart(labels, temperatures) {
    const ctx = document.getElementById('forecastTempChart');
    
    if (forecastTempChart) {
        forecastTempChart.destroy();
    }
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 99, 132, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 99, 132, 0.0)');
    
    forecastTempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#ff6384',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#ff6384',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        font: { size: 14 },
                        color: '#333'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Temperature: ' + context.parsed.y + '°C';
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        font: { size: 14 }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (24-Hour Format)',
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// 2. Humidity Forecast Chart
function createForecastHumidityChart(labels, humidities) {
    const ctx = document.getElementById('forecastHumidityChart');
    
    if (forecastHumidityChart) {
        forecastHumidityChart.destroy();
    }
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.4)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.0)');
    
    forecastHumidityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humidities,
                borderColor: '#36a2eb',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#36a2eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        font: { size: 14 },
                        color: '#333'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Humidity: ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        font: { size: 14 }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (24-Hour Format)',
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// 3. Wind Speed Forecast Chart
function createForecastWindChart(labels, windSpeeds) {
    const ctx = document.getElementById('forecastWindChart');
    
    if (forecastWindChart) {
        forecastWindChart.destroy();
    }
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');
    
    forecastWindChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Wind Speed (m/s)',
                data: windSpeeds,
                borderColor: '#4bc0c0',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#4bc0c0',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        font: { size: 14 },
                        color: '#333'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Wind Speed: ' + context.parsed.y + ' m/s';
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 30,
                    title: {
                        display: true,
                        text: 'Wind Speed (m/s)',
                        font: { size: 14 }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (24-Hour Format)',
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}