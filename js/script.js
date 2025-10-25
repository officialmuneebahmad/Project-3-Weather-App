// API KEYS
const WEATHER_API_KEY = '9edc182ce8acbc3fb823f614fc59c4a2';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherDataDiv = document.getElementById('weatherData');
const errorMessage = document.getElementById('errorMessage');

// Add click event listener
getWeatherBtn.addEventListener('click', getWeather);

// MAIN FUNCTION - Try multiple geolocation methods
async function getWeather() {
    try {
        showLoading();
        
        let position;
        let method = 'Unknown';
        
        // Method 1: Try IP-based geolocation (most reliable, no permission needed)
        try {
            position = await getIPGeolocation();
            method = 'IP Geolocation';
            console.log('✅ Using IP-based location');
        } catch (ipError) {
            console.log('⚠️ IP geolocation failed, trying browser GPS...');
            
            // Method 2: Fallback to browser geolocation (needs permission)
            try {
                position = await getUserLocation();
                method = 'GPS/WiFi';
                console.log('✅ Using browser geolocation');
            } catch (browserError) {
                throw new Error('Could not get your location. Please enable location services or check your internet connection.');
            }
        }
        
        const { latitude, longitude } = position.coords;
        console.log(`📍 Coordinates: ${latitude}, ${longitude}`);
        console.log(`🎯 Accuracy: ${position.coords.accuracy} meters`);
        console.log(`📡 Method: ${method}`);
        
        // Fetch weather data
        const weatherData = await fetchWeatherData(latitude, longitude);
        const forecastData = await fetchForecastData(latitude, longitude);
        
        // Display results
        displayWeather(weatherData, position.coords.accuracy, method);
        displayForecastChart(forecastData);
        
    } catch (error) {
        showError(error.message);
        console.error('❌ Error:', error);
    }
}

// 🔥 NEW: Free IP-based Geolocation (No API Key Required!)
async function getIPGeolocation() {
    // Try multiple free services for reliability
    const services = [
        {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            parse: (data) => ({
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: 5000, // IP-based is ~5km accuracy
                city: data.city,
                country: data.country_name
            })
        },
        {
            name: 'ip-api.com',
            url: 'http://ip-api.com/json/',
            parse: (data) => ({
                latitude: data.lat,
                longitude: data.lon,
                accuracy: 5000,
                city: data.city,
                country: data.country
            })
        },
        {
            name: 'ipgeolocation.io',
            url: 'https://api.ipgeolocation.io/ipgeo?apiKey=',
            parse: (data) => ({
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                accuracy: 5000,
                city: data.city,
                country: data.country_name
            })
        }
    ];
    
    // Try each service until one works
    for (const service of services) {
        try {
            console.log(`Trying ${service.name}...`);
            const response = await fetch(service.url);
            
            if (!response.ok) continue;
            
            const data = await response.json();
            const location = service.parse(data);
            
            // Validate the data
            if (location.latitude && location.longitude) {
                console.log(`✅ Got location from ${service.name}`);
                return {
                    coords: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        accuracy: location.accuracy
                    }
                };
            }
        } catch (error) {
            console.log(`${service.name} failed:`, error.message);
            continue;
        }
    }
    
    throw new Error('All IP geolocation services failed');
}

// FALLBACK: Browser Geolocation (High Accuracy GPS/WiFi)
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
                        reject(new Error('Location permission denied'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Location unavailable'));
                        break;
                    case error.TIMEOUT:
                        reject(new Error('Location request timed out'));
                        break;
                    default:
                        reject(new Error('Unknown location error'));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Fetch current weather data
async function fetchWeatherData(lat, lon) {
    const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API key');
        } else if (response.status === 404) {
            throw new Error('Location not found');
        } else {
            throw new Error('Failed to fetch weather data');
        }
    }
    
    return await response.json();
}

// Fetch forecast data
async function fetchForecastData(lat, lon) {
    const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
    }
    
    return await response.json();
}

// Display weather with accuracy and method info
function displayWeather(data, accuracy, method) {
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    // Show accuracy and detection method
    const accuracyText = accuracy ? ` (±${Math.round(accuracy/1000)}km)` : '';
    const methodEmoji = method === 'GPS/WiFi' ? '📡' : '🌐';
    
    document.getElementById('city').textContent = `${methodEmoji} Location: ${city}${accuracyText}`;
    document.getElementById('country').textContent = `🗺️ Country: ${country}`;
    document.getElementById('temperature').textContent = `🌡️ Temperature: ${temp}°C`;
    document.getElementById('description').textContent = `🛰️ Condition: ${description}`;
    document.getElementById('humidity').textContent = `💧 Humidity: ${humidity}%`;
    document.getElementById('windSpeed').textContent = `🍃 Wind Speed: ${windSpeed} m/s`;

    // Update charts
    if (window.updateWeatherCharts) {
        window.updateWeatherCharts(temp, humidity, windSpeed);
    }

    // Show advice
    showWeatherAdvice(temp, humidity, windSpeed);

    hideLoading();
    hideError();
    weatherDataDiv.style.display = 'block';
}

// Display forecast charts
function displayForecastChart(data) {
    const next24Hours = data.list.slice(0, 8);
    
    const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000);
        return date.getHours() + ':00';
    });
    
    const temperatures = next24Hours.map(item => Math.round(item.main.temp));
    const humidities = next24Hours.map(item => item.main.humidity);
    const windSpeeds = next24Hours.map(item => Math.round(item.wind.speed * 10) / 10);
    
    if (window.createForecastCharts) {
        window.createForecastCharts(labels, temperatures, humidities, windSpeeds);
    }
}

// Weather advice
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
    loadingDiv.innerHTML = `
        <div class="text-center">
            <p class="text-lg">🔍 Detecting your location...</p>
            <p class="text-sm text-gray-600 mt-2">Trying multiple methods for best accuracy</p>
        </div>
    `;
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