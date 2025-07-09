// Weather and Location Information Service
// Provides real-time weather data and location information

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
}

interface LocationInfo {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
  currency?: string;
  languages?: string[];
}

// Get weather data from OpenWeatherMap API
export async function getWeatherData(location: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Weather API key not configured. Please set WEATHER_API_KEY or OPENWEATHER_API_KEY environment variable.");
  }

  try {
    // Get coordinates first
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding failed: ${geocodeResponse.status}`);
    }
    
    const geocodeData = await geocodeResponse.json();
    if (!geocodeData.length) {
      throw new Error(`Location "${location}" not found`);
    }
    
    const { lat, lon, name, country } = geocodeData[0];
    
    // Get weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API failed: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    
    return {
      location: `${name}, ${country}`,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      feelsLike: Math.round(weatherData.main.feels_like),
      visibility: Math.round(weatherData.visibility / 1000), // Convert to km
      pressure: weatherData.main.pressure,
      uvIndex: 0 // UV index requires separate API call
    };
    
  } catch (error) {
    throw new Error(`Failed to get weather data: ${error.message}`);
  }
}

// Get detailed location information
export async function getLocationInfo(location: string): Promise<LocationInfo> {
  const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Weather API key not configured for location lookup.");
  }

  try {
    // Use OpenWeatherMap geocoding API for basic location info
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
    const response = await fetch(geocodeUrl);
    
    if (!response.ok) {
      throw new Error(`Location lookup failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.length) {
      throw new Error(`Location "${location}" not found`);
    }
    
    const locationData = data[0];
    
    return {
      name: locationData.name,
      country: locationData.country,
      region: locationData.state || locationData.country,
      latitude: locationData.lat,
      longitude: locationData.lon,
      timezone: "UTC", // Basic timezone info
      population: undefined,
      currency: undefined,
      languages: undefined
    };
    
  } catch (error) {
    throw new Error(`Failed to get location info: ${error.message}`);
  }
}

// Enhanced location data with time zone information
export async function getWorldTimeInfo(location: string): Promise<{ location: string; localTime: string; timezone: string; utcOffset: string }> {
  try {
    const locationInfo = await getLocationInfo(location);
    
    // Use WorldTimeAPI for accurate timezone info
    const timeApiUrl = `https://worldtimeapi.org/api/timezone`;
    const timeResponse = await fetch(timeApiUrl);
    
    if (timeResponse.ok) {
      const timezones = await timeResponse.json();
      
      // Find closest timezone based on location name
      const matchingTimezone = timezones.find((tz: string) => 
        tz.toLowerCase().includes(locationInfo.country.toLowerCase()) ||
        tz.toLowerCase().includes(locationInfo.name.toLowerCase())
      ) || timezones[0];
      
      // Get current time for that timezone
      const currentTimeResponse = await fetch(`https://worldtimeapi.org/api/timezone/${matchingTimezone}`);
      if (currentTimeResponse.ok) {
        const timeData = await currentTimeResponse.json();
        
        return {
          location: `${locationInfo.name}, ${locationInfo.country}`,
          localTime: new Date(timeData.datetime).toLocaleString(),
          timezone: timeData.timezone,
          utcOffset: timeData.utc_offset
        };
      }
    }
    
    // Fallback to UTC time
    return {
      location: `${locationInfo.name}, ${locationInfo.country}`,
      localTime: new Date().toLocaleString(),
      timezone: "UTC",
      utcOffset: "+00:00"
    };
    
  } catch (error) {
    throw new Error(`Failed to get time info: ${error.message}`);
  }
}

// Format weather report for AI response
export function formatWeatherReport(weather: WeatherData): string {
  return `Current weather in ${weather.location}:
🌡️ Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)
☁️ Conditions: ${weather.condition}
💧 Humidity: ${weather.humidity}%
💨 Wind Speed: ${weather.windSpeed} km/h
👁️ Visibility: ${weather.visibility} km
🔽 Pressure: ${weather.pressure} hPa`;
}

// Format location report for AI response
export function formatLocationReport(location: LocationInfo, timeInfo?: any): string {
  let report = `Information about ${location.name}:
📍 Location: ${location.name}, ${location.region}, ${location.country}
🌐 Coordinates: ${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`;

  if (timeInfo) {
    report += `
🕐 Local Time: ${timeInfo.localTime}
⏰ Timezone: ${timeInfo.timezone} (${timeInfo.utcOffset})`;
  }

  if (location.population) {
    report += `\n👥 Population: ${location.population.toLocaleString()}`;
  }

  return report;
}

// Check if a message is asking for weather information
export function isWeatherQuery(message: string): boolean {
  const weatherKeywords = ['weather', 'temperature', 'temp', 'climate', 'forecast', 'rain', 'snow', 'sunny', 'cloudy'];
  const messageWords = message.toLowerCase().split(' ');
  
  return weatherKeywords.some(keyword => 
    messageWords.some(word => word.includes(keyword))
  );
}

// Check if a message is asking for location/time information
export function isLocationQuery(message: string): boolean {
  const locationKeywords = ['time', 'timezone', 'where is', 'location', 'country', 'city', 'place'];
  const messageWords = message.toLowerCase();
  
  return locationKeywords.some(keyword => messageWords.includes(keyword));
}

// Extract location from user message
export function extractLocation(message: string): string | null {
  // Simple location extraction - looks for "in [location]" or "weather [location]"
  const patterns = [
    /(?:weather|temperature|time|in)\s+(?:in\s+)?([a-zA-Z\s,]+?)(?:\?|$|\.)/i,
    /(?:what's|how's|current)\s+(?:the\s+)?(?:weather|time)\s+(?:in\s+)?([a-zA-Z\s,]+?)(?:\?|$|\.)/i,
    /([a-zA-Z\s,]+)\s+(?:weather|time|temperature)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}