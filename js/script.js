// STEP 1: Set up your API keyy
const API_KEY = '9edc182ce8acbc3fb823f614fc59c4a2';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// STEP 2: Get DOM elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherDataDiv = document.getElementById('weatherData');
const errorMessage = document.getElementById('errorMessage');

// STEP 3: Add click event listener
getWeatherBtn.addEventListener('click', getWeather);

// STEP 4: Main function - Gets location then fetches weather
async function getWeather() {
    try {
        // Show loading, hide other sections
        showLoading();
        
        // Get user's coordinates
        const position = await getUserLocation();
        const { latitude, longitude } = position.coords;
        
        console.log(`Your coordinates: ${latitude}, ${longitude}`);
        
        // Fetch current weather data
        const weatherData = await fetchWeatherData(latitude, longitude);
        
        // Fetch forecast data
        const forecastData = await fetchForecastData(latitude, longitude);
        
        // Display the weather
        displayWeather(weatherData);
        
        // Display forecast chart
        displayForecastChart(forecastData);
        
    } catch (error) {
        // Handle any errors
        showError(error.message);
        console.error('Error:', error);
    }
}

// STEP 5: Get user's geolocation
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            error => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Location permission denied. Please enable location access.'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Location information unavailable.'));
                        break;
                    case error.TIMEOUT:
                        reject(new Error('Location request timed out.'));
                        break;
                    default:
                        reject(new Error('An unknown error occurred.'));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// STEP 6: Fetch current weather data from API
async function fetchWeatherData(lat, lon) {
    const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your API key.');
        } else if (response.status === 404) {
            throw new Error('Location not found.');
        } else {
            throw new Error('Failed to fetch weather data.');
        }
    }
    
    const data = await response.json();
    console.log('Weather data:', data);
    return data;
}

// NEW: Fetch forecast data (5-day/3-hour)
async function fetchForecastData(lat, lon) {
    const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch forecast data.');
    }
    
    const data = await response.json();
    console.log('Forecast data:', data);
    return data;
}

// STEP 7: Display current weather data
function displayWeather(data) {
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    // Update DOM with emojis
    document.getElementById('city').textContent = `📍 Nearest Location: ${city}`;
    document.getElementById('country').textContent = `🗺️ Country: ${country}`;
    document.getElementById('temperature').textContent = `🌡️ Temperature: ${temp}°C`;
    document.getElementById('description').textContent = `🛰️ Condition: ${description}`;
    document.getElementById('humidity').textContent = `💧 Humidity: ${humidity}%`;
    document.getElementById('windSpeed').textContent = `🍃 Wind Speed: ${windSpeed} m/s`;

    // Send data to charts.js
    console.log('Updating charts with:', temp, humidity, windSpeed);
    if (window.updateWeatherCharts) {
        window.updateWeatherCharts(temp, humidity, windSpeed);
    } else {
        console.error('updateWeatherCharts function not found!');
    }

    // Generate weather advice
    showWeatherAdvice(temp, humidity, windSpeed);

    hideLoading();
    hideError();
    weatherDataDiv.style.display = 'block';
}

// NEW: Display all three forecast charts
function displayForecastChart(data) {
    // Get next 24 hours (8 data points, 3-hour intervals)
    const next24Hours = data.list.slice(0, 8);
    
    // Extract time, temperature, humidity, and wind speed
    const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000);
        return date.getHours() + ':00'; // Show only hour
    });
    
    const temperatures = next24Hours.map(item => Math.round(item.main.temp));
    const humidities = next24Hours.map(item => item.main.humidity);
    const windSpeeds = next24Hours.map(item => Math.round(item.wind.speed * 10) / 10); // Round to 1 decimal
    
    // Call the chart creation function
    if (window.createForecastCharts) {
        window.createForecastCharts(labels, temperatures, humidities, windSpeeds);
    }
}


// Weather-based advice
function showWeatherAdvice(temp, humidity, windSpeed) {
    const adviceEl = document.getElementById('weatherAdvice');
    let advice = '';

    if (temp < 10) advice += "🥶 It's cold — wear warm clothes. ";
    else if (temp < 20) advice += "🧥 Cool and pleasant outside. ";
    else if (temp < 30) advice += "🌤️ Warm weather — comfortable. ";
    else if (temp < 40) advice += "🔥 It's hot — stay hydrated. ";
    else advice += "☠️ Extreme heat — avoid going out. ";

    if (humidity < 30) advice += "💨 Air is dry — drink more water. ";
    else if (humidity < 60) advice += "🙂 Humidity is comfortable. ";
    else if (humidity < 80) advice += "😓 Quite humid — sweating may feel sticky. ";
    else advice += "💦 Very humid — expect heavy air and possible rain. ";

    if (windSpeed < 0.5) advice += "🌫️ Calm air. ";
    else if (windSpeed < 3) advice += "🍃 Light breeze. ";
    else if (windSpeed < 8) advice += "💨 Moderate wind. ";
    else if (windSpeed < 15) advice += "🌬️ Strong wind — secure loose items. ";
    else advice += "⚠️ Dangerous wind — stay indoors. ";

    adviceEl.textContent = advice;
}

// UI Helper Functions
function showLoading() {
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    weatherDataDiv.style.display = 'none';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function showError(message) {
    hideLoading();
    weatherDataDiv.style.display = 'none';
    errorMessage.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}