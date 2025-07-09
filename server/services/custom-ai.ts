// Custom AI Integration with Weather and Location Intelligence
// Configure this file to use your own AI service

import { 
  getWeatherData, 
  getLocationInfo, 
  getWorldTimeInfo, 
  formatWeatherReport, 
  formatLocationReport,
  isWeatherQuery,
  isLocationQuery,
  extractLocation 
} from "./weather-location";

interface CustomAIConfig {
  endpoint: string;
  apiKey: string;
  model?: string;
  headers?: Record<string, string>;
}

// Configure your AI service here
const AI_CONFIG: CustomAIConfig = {
  endpoint: process.env.CUSTOM_AI_ENDPOINT || "https://api.openai.com/v1/chat/completions",
  apiKey: process.env.CUSTOM_AI_API_KEY || process.env.OPENAI_API_KEY || "",
  model: process.env.CUSTOM_AI_MODEL || "gpt-4o-mini",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.CUSTOM_AI_API_KEY || process.env.OPENAI_API_KEY || ""}`
  }
};

// Enhanced system prompt with weather and location capabilities
const SYSTEM_PROMPT = `You are Turbo Answer, a helpful AI assistant with real-time weather and location knowledge. 

KEY CAPABILITIES:
- Provide current weather information for any location worldwide
- Share accurate time zone and local time information
- Offer detailed geographical and cultural information about places
- Answer questions about cities, countries, regions, and landmarks
- Give travel tips, local customs, and practical location advice

RESPONSE STYLE:
- Provide clear, direct answers without complex explanations
- Keep responses brief and to the point
- Use simple, everyday language
- When weather or location data is provided, use the real-time information
- Always be helpful and informative about world locations

WORLD KNOWLEDGE:
- You have comprehensive knowledge about every place in the world
- You understand geography, climate patterns, cultures, and time zones
- You can provide practical information for travelers and curious minds
- You know about landmarks, cities, countries, and local customs`;

export async function generateCustomAIResponse(
  userMessage: string, 
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> {
  try {
    // Check if this is a weather or location query
    let enhancedMessage = userMessage;
    let additionalContext = "";
    
    // Handle weather queries
    if (isWeatherQuery(userMessage)) {
      const location = extractLocation(userMessage);
      if (location) {
        try {
          const weatherData = await getWeatherData(location);
          const weatherReport = formatWeatherReport(weatherData);
          additionalContext = `\n\nCURRENT WEATHER DATA:\n${weatherReport}`;
          enhancedMessage = `${userMessage}\n\n[Real-time weather data provided - please use this current information in your response]`;
        } catch (error) {
          additionalContext = `\n\nWeather data unavailable: ${error.message}. Please provide general weather information if possible.`;
        }
      }
    }
    
    // Handle location/time queries
    else if (isLocationQuery(userMessage)) {
      const location = extractLocation(userMessage);
      if (location) {
        try {
          const [locationInfo, timeInfo] = await Promise.allSettled([
            getLocationInfo(location),
            getWorldTimeInfo(location)
          ]);
          
          if (locationInfo.status === 'fulfilled') {
            const timeData = timeInfo.status === 'fulfilled' ? timeInfo.value : null;
            const locationReport = formatLocationReport(locationInfo.value, timeData);
            additionalContext = `\n\nLOCATION & TIME DATA:\n${locationReport}`;
            enhancedMessage = `${userMessage}\n\n[Real-time location and time data provided - please use this current information in your response]`;
          }
        } catch (error) {
          additionalContext = `\n\nLocation data unavailable: ${error.message}. Please provide general information if possible.`;
        }
      }
    }
    
    // Keep only last 3 messages for speed
    const recentHistory = conversationHistory.slice(-3);
    
    // Prepare messages with enhanced context
    const messages = [
      { role: "system", content: SYSTEM_PROMPT + additionalContext }
    ];
    
    // Add conversation history
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      });
    });
    
    // Add current user message (enhanced if weather/location query)
    messages.push({
      role: "user",
      content: enhancedMessage
    });
    
    // Call your AI service
    const response = await fetch(AI_CONFIG.endpoint, {
      method: "POST",
      headers: AI_CONFIG.headers,
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle OpenAI-style response format
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    // Handle other response formats
    if (data.response) {
      return data.response;
    }
    
    if (data.content) {
      return data.content;
    }
    
    throw new Error("Unexpected AI response format");
    
  } catch (error) {
    console.error("Custom AI Error:", error);
    return "I'm having trouble connecting to the AI service right now. Please check your configuration and try again.";
  }
}

// Alternative: Direct API integration without external dependencies
export async function generateSimpleAIResponse(
  userMessage: string, 
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> {
  // If you have a simple HTTP API that takes text and returns text
  const simpleEndpoint = process.env.SIMPLE_AI_ENDPOINT;
  const simpleApiKey = process.env.SIMPLE_AI_API_KEY;
  
  if (!simpleEndpoint || !simpleApiKey) {
    return generateCustomAIResponse(userMessage, conversationHistory);
  }
  
  try {
    const response = await fetch(simpleEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${simpleApiKey}`
      },
      body: JSON.stringify({
        prompt: userMessage,
        max_length: 500
      })
    });
    
    if (!response.ok) {
      throw new Error(`Simple AI service error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || data.response || "No response from AI service";
    
  } catch (error) {
    console.error("Simple AI Error:", error);
    return generateCustomAIResponse(userMessage, conversationHistory);
  }
}