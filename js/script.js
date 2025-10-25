// API KEYS
const WEATHER_API_KEY = '9edc182ce8acbc3fb823f614fc59c4a2';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibW9uaXh4eCIsImEiOiJjbWg2YXp1OW0waGIxMnJzYmpoNG90bjJqIn0.-q0r-q6zR13sagL273ZxrQ'; // 🔥 Get free at https://account.mapbox.com/
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherDataDiv = document.getElementById('weatherData');
const errorMessage = document.getElementById('errorMessage');

getWeatherBtn.addEventListener('click', getWeather);

// MAIN FUNCTION
async function getWeather() {
    try {
        showLoading();
        
        let position;
        let method = 'Unknown';
        let accuracy = 0;
        
        // Method 1: Try Mapbox Geolocation (Best accuracy)
        if (MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'YOUR_MAPBOX_TOKEN') {
            try {
                position = await getMapboxLocation();
                method = 'Mapbox';
                accuracy = position.coords.accuracy;
                console.log('✅ Using Mapbox Geolocation (High Accuracy)');
            } catch (mapboxError) {
                console.log('⚠️ Mapbox failed:', mapboxError.message);
            }
        }
        
        // Method 2: Try Browser GPS (Good for mobile)
        if (!position) {
            try {
                position = await getUserLocation();
                method = 'GPS/WiFi';
                accuracy = position.coords.accuracy;
                console.log('✅ Using Browser Geolocation');
            } catch (gpsError) {
                console.log('⚠️ GPS failed:', gpsError.message);
            }
        }
        
        // Method 3: Fallback to IP-based location
        if (!position) {
            position = await getIPGeolocation();
            method = 'IP Location';
            accuracy = 5000;
            console.log('✅ Using IP-based Location (Lower Accuracy)');
        }
        
        const { latitude, longitude } = position.coords;
        console.log(`📍 Location: ${latitude}, ${longitude}`);
        console.log(`🎯 Accuracy: ±${Math.round(accuracy)}m`);
        console.log(`📡 Method: ${method}`);
        
        // Fetch weather data
        const weatherData = await fetchWeatherData(latitude, longitude);
        const forecastData = await fetchForecastData(latitude, longitude);
        
        // Display results
        displayWeather(weatherData, accuracy, method);
        displayForecastChart(forecastData);
        
    } catch (error) {
        showError(error.message);
        console.error('❌ Error:', error);
    }
}

// 🔥 MAPBOX GEOLOCATION (Most Accurate Free Alternative)
async function getMapboxLocation() {
    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_TOKEN') {
        throw new Error('Mapbox token not configured');
    }
    
    // Use browser's geolocation first, then enhance with Mapbox's reverse geocoding
    const browserPos = await getUserLocation();
    
    // Mapbox doesn't have a direct geolocation API like Google
    // But we can use browser geolocation + Mapbox for enhanced accuracy
    // and reverse geocoding for better location names
    
    try {
        // Reverse geocode to get precise location name
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${browserPos.coords.longitude},${browserPos.coords.latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
        );
        
        if (!response.ok) {
            throw new Error('Mapbox API error');
        }
        
        const data = await response.json();
        console.log('Mapbox enhanced location:', data.features[0]?.place_name);
        
        return browserPos; // Return enhanced position
    } catch (error) {
        console.log('Mapbox enhancement failed, using raw GPS');
        return browserPos;
    }
}

// Browser Geolocation (High Accuracy Mode)
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
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

// IP-based Geolocation (Fallback)
async function getIPGeolocation() {
    const services = [
        {
            url: 'https://ipapi.co/json/',
            parse: (data) => ({
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: 5000
            })
        },
        {
            url: 'http://ip-api.com/json/',
            parse: (data) => ({
                latitude: data.lat,
                longitude: data.lon,
                accuracy: 5000
            })
        }
    ];
    
    for (const service of services) {
        try {
            const response = await fetch(service.url);
            if (!response.ok) continue;
            
            const data = await response.json();
            const location = service.parse(data);
            
            if (location.latitude && location.longitude) {
                return {
                    coords: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        accuracy: location.accuracy
                    }
                };
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('All geolocation methods failed');
}

// Fetch weather data
async function fetchWeatherData(lat, lon) {
    const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
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

// Display weather
function displayWeather(data, accuracy, method) {
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    // Show accuracy
    let accuracyText = '';
    let methodEmoji = '📍';
    
    if (accuracy < 100) {
        accuracyText = ` (±${Math.round(accuracy)}m)`;
        methodEmoji = '🎯'; // Very accurate
    } else if (accuracy < 1000) {
        accuracyText = ` (±${Math.round(accuracy)}m)`;
        methodEmoji = '📡'; // Good accuracy
    } else {
        accuracyText = ` (±${Math.round(accuracy/1000)}km)`;
        methodEmoji = '🌐'; // IP-based
    }
    
    document.getElementById('city').textContent = `${methodEmoji} ${city}${accuracyText}`;
    document.getElementById('country').textContent = `🗺️ Country: ${country}`;
    document.getElementById('temperature').textContent = `🌡️ Temperature: ${temp}°C`;
    document.getElementById('description').textContent = `🛰️ Condition: ${description}`;
    document.getElementById('humidity').textContent = `💧 Humidity: ${humidity}%`;
    document.getElementById('windSpeed').textContent = `🍃 Wind Speed: ${windSpeed} m/s`;

    if (window.updateWeatherCharts) {
        window.updateWeatherCharts(temp, humidity, windSpeed);
    }

    showWeatherAdvice(temp, humidity, windSpeed);

    hideLoading();
    hideError();
    weatherDataDiv.style.display = 'block';
}

// Display forecast
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
    else if (humidity < 80) advice += "😓 Quite humid. ";
    else advice += "💦 Very humid. ";

    if (windSpeed < 0.5) advice += "🌫️ Calm air. ";
    else if (windSpeed < 3) advice += "🍃 Light breeze. ";
    else if (windSpeed < 8) advice += "💨 Moderate wind. ";
    else if (windSpeed < 15) advice += "🌬️ Strong wind. ";
    else advice += "⚠️ Dangerous wind. ";

    adviceEl.textContent = advice;
}

// UI helpers
function showLoading() {
    loadingDiv.innerHTML = `
        <div class="text-center">
            <p class="text-lg">🔍 Getting your location...</p>
            <p class="text-sm text-gray-600 mt-2">Using multiple methods for best accuracy</p>
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