// Multi-AI System: The Most Powerful AI Assistant
// Combines multiple AI models for maximum intelligence and capability

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

export const AI_MODELS = {
  // Tier 1: Premium Models (Most Powerful)
  premium: {
    "claude-3-opus": {
      name: "Claude 3 Opus",
      provider: "anthropic",
      strengths: ["Complex reasoning", "Creative writing", "Mathematical analysis"],
      maxTokens: 4000,
      temperature: 0.7
    },
    "gpt-4": {
      name: "GPT-4",
      provider: "openai", 
      strengths: ["General intelligence", "Code generation", "Problem solving"],
      maxTokens: 3000,
      temperature: 0.6
    },
    "claude-3-sonnet": {
      name: "Claude 3 Sonnet",
      provider: "anthropic",
      strengths: ["Balanced performance", "Fast responses", "Detailed analysis"],
      maxTokens: 2000,
      temperature: 0.5
    }
  },
  
  // Tier 2: Advanced Models
  advanced: {
    "gpt-3.5-turbo": {
      name: "GPT-3.5 Turbo",
      provider: "openai",
      strengths: ["Speed", "General knowledge", "Conversational"],
      maxTokens: 1500,
      temperature: 0.4
    },
    "gemini-pro": {
      name: "Gemini Pro",
      provider: "google",
      strengths: ["Multimodal", "Code understanding", "Research"],
      maxTokens: 2000,
      temperature: 0.5
    }
  },
  
  // Tier 3: Specialized Models
  specialized: {
    "claude-instant": {
      name: "Claude Instant",
      provider: "anthropic",
      strengths: ["Speed", "Efficiency", "Quick responses"],
      maxTokens: 1000,
      temperature: 0.3
    }
  }
};

// Advanced user intent analysis with complexity scoring
function analyzeUserIntent(message: string, conversationHistory: Array<{role: string, content: string}>): {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  domain: string;
  reasoning: boolean;
  creativity: boolean;
  technical: boolean;
  recommended_tier: 'premium' | 'advanced' | 'specialized';
  recommended_model: string;
} {
  const msg = message.toLowerCase();
  const historyContext = conversationHistory.slice(-3).map(h => h.content.toLowerCase()).join(' ');
  
  // Complexity indicators
  const complexityMarkers = {
    expert: ['mathematical proof', 'algorithm design', 'system architecture', 'research methodology', 'philosophical analysis', 'advanced physics', 'quantum mechanics', 'machine learning theory'],
    complex: ['analyze', 'compare', 'evaluate', 'synthesize', 'design', 'create', 'explain why', 'deep dive', 'comprehensive'],
    moderate: ['how to', 'what is', 'explain', 'help me', 'guide', 'steps', 'process', 'method'],
    simple: ['what', 'when', 'where', 'who', 'yes', 'no', 'quick', 'simple', 'basic']
  };
  
  // Domain classification
  const domains = {
    technical: ['programming', 'code', 'software', 'algorithm', 'database', 'api', 'development', 'technical'],
    scientific: ['physics', 'chemistry', 'biology', 'mathematics', 'research', 'analysis', 'theory', 'experiment'],
    creative: ['write', 'story', 'poem', 'creative', 'art', 'design', 'brainstorm', 'innovative'],
    business: ['strategy', 'marketing', 'finance', 'business', 'management', 'planning', 'analysis'],
    general: ['weather', 'location', 'time', 'news', 'facts', 'information', 'help']
  };
  
  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' | 'expert' = 'simple';
  for (const [level, markers] of Object.entries(complexityMarkers)) {
    if (markers.some(marker => msg.includes(marker) || historyContext.includes(marker))) {
      complexity = level as any;
      break;
    }
  }
  
  // Determine domain
  let domain = 'general';
  for (const [domainName, keywords] of Object.entries(domains)) {
    if (keywords.some(keyword => msg.includes(keyword))) {
      domain = domainName;
      break;
    }
  }
  
  // Capability requirements
  const reasoning = msg.includes('why') || msg.includes('because') || msg.includes('reason') || msg.includes('analyze') || msg.includes('explain');
  const creativity = msg.includes('creative') || msg.includes('write') || msg.includes('story') || msg.includes('poem') || msg.includes('design');
  const technical = domain === 'technical' || msg.includes('code') || msg.includes('programming');
  
  // Model recommendation logic
  let recommended_tier: 'premium' | 'advanced' | 'specialized' = 'advanced';
  let recommended_model = 'gpt-3.5-turbo';
  
  if (complexity === 'expert' || (complexity === 'complex' && (reasoning || creativity))) {
    recommended_tier = 'premium';
    recommended_model = creativity ? 'claude-3-opus' : reasoning ? 'gpt-4' : 'claude-3-sonnet';
  } else if (complexity === 'complex' || technical) {
    recommended_tier = 'advanced';
    recommended_model = technical ? 'gpt-3.5-turbo' : 'gemini-pro';
  } else {
    recommended_tier = 'specialized';
    recommended_model = 'claude-instant';
  }
  
  return {
    complexity,
    domain,
    reasoning,
    creativity,
    technical,
    recommended_tier,
    recommended_model
  };
}

// Master AI orchestrator - routes to the best model for each query
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}> = [],
  subscriptionTier: string = "free",
  selectedModel?: string
): Promise<string> {
  try {
    // Analyze user intent and complexity
    const intent = analyzeUserIntent(userMessage, conversationHistory);
    console.log(`[AI Router] Intent: ${intent.complexity} ${intent.domain}, Model: ${intent.recommended_model}`);
    
    // Enhanced context with weather/location data
    let enhancedMessage = userMessage;
    let additionalContext = "";
    
    // Weather intelligence
    if (isWeatherQuery(userMessage)) {
      const location = extractLocation(userMessage);
      if (location) {
        try {
          const weatherData = await getWeatherData(location);
          const weatherReport = formatWeatherReport(weatherData);
          additionalContext = `\n\nREAL-TIME WEATHER DATA:\n${weatherReport}`;
          enhancedMessage = `${userMessage}\n\n[Live weather data provided - use this current information in your response]`;
        } catch (error) {
          additionalContext = `\n\nWeather data unavailable: ${error.message}`;
        }
      }
    }
    
    // Location intelligence
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
            additionalContext = `\n\nREAL-TIME LOCATION DATA:\n${locationReport}`;
            enhancedMessage = `${userMessage}\n\n[Live location and time data provided - use this current information]`;
          }
        } catch (error) {
          additionalContext = `\n\nLocation data unavailable: ${error.message}`;
        }
      }
    }
    
    // Check available API keys and select appropriate model
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    
    // Model selection with API key availability
    const availableModels = getAvailableModels(subscriptionTier);
    const modelToUse = selectedModel || intent.recommended_model;
    
    // Smart fallback based on available API keys
    let finalModel = modelToUse;
    const modelConfig = availableModels[modelToUse];
    
    if (!modelConfig || 
        (modelConfig.provider === 'anthropic' && !hasAnthropic) ||
        (modelConfig.provider === 'openai' && !hasOpenAI) ||
        (modelConfig.provider === 'google' && !hasGemini)) {
      
      // Find best available model based on API keys
      if (hasOpenAI) {
        finalModel = intent.complexity === 'expert' || intent.complexity === 'complex' ? 'gpt-4' : 'gpt-3.5-turbo';
      } else if (hasGemini) {
        finalModel = 'gemini-pro';
      } else if (hasAnthropic) {
        finalModel = intent.complexity === 'expert' ? 'claude-3-opus' : 'claude-instant';
      } else {
        throw new Error("No AI API keys configured. Please add OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to your environment.");
      }
    }
    
    console.log(`[AI Router] Selected model: ${finalModel}`);
    
    // Route to appropriate AI service
    const finalModelConfig = availableModels[finalModel] || AI_MODELS.advanced['gpt-3.5-turbo'];
    
    switch (finalModelConfig.provider) {
      case 'anthropic':
        return await generateAnthropicResponse(enhancedMessage, conversationHistory, finalModel, intent, additionalContext);
      case 'openai':
        return await generateOpenAIResponse(enhancedMessage, conversationHistory, finalModel, intent, additionalContext);
      case 'google':
        return await generateGeminiResponse(enhancedMessage, conversationHistory, finalModel, intent, additionalContext);
      default:
        throw new Error(`Unsupported AI provider: ${finalModelConfig.provider}`);
    }
    
  } catch (error) {
    console.error('[AI Router] Error:', error);
    
    // Provide helpful error message based on the issue
    if (error.message?.includes('API key not configured')) {
      return "I need an AI API key to respond. Please add one of these to your environment:\n\n• OPENAI_API_KEY for GPT models\n• ANTHROPIC_API_KEY for Claude models\n• GEMINI_API_KEY for Gemini models\n\nOnce configured, I'll be able to provide intelligent responses!";
    }
    
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  }
}

// Enhanced Gemini integration with advanced reasoning
async function generateGeminiResponse(
  userMessage: string,
  context: Array<{role: string, content: string}>,
  model: string,
  userIntent: any,
  additionalContext: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your environment.");
  }
  
  const modelConfig = AI_MODELS.advanced[model] || AI_MODELS.advanced['gemini-pro'];
  
  // Enhanced system prompt based on intent
  const systemPrompt = `You are Turbo Answer, the world's most powerful AI assistant. You excel at:
  
  🧠 ADVANCED REASONING: Complex problem-solving and logical analysis
  🌍 WORLD KNOWLEDGE: Real-time data integration and comprehensive information
  ⚡ INTELLIGENT RESPONSES: Tailored to user's expertise level and needs
  
  Current context: ${userIntent.domain} domain, ${userIntent.complexity} complexity
  Required capabilities: ${userIntent.reasoning ? 'reasoning' : ''} ${userIntent.creativity ? 'creativity' : ''} ${userIntent.technical ? 'technical' : ''}
  
  RESPONSE GUIDELINES:
  - Provide expert-level insights with clear explanations
  - Use real-time data when available
  - Adapt complexity to user's level
  - Be comprehensive yet concise
  - Show your reasoning process for complex topics
  
  ${additionalContext}`;
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }]
        }],
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxTokens,
          topP: 0.8,
          topK: 40
        }
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate response";
    
  } catch (error) {
    console.error('[Gemini] Error:', error);
    throw error;
  }
}

// Enhanced OpenAI integration with advanced capabilities
async function generateOpenAIResponse(
  userMessage: string,
  context: Array<{role: string, content: string}>,
  model: string,
  userIntent: any,
  additionalContext: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add OPENAI_API_KEY to your environment.");
  }
  
  const modelConfig = AI_MODELS.premium[model] || AI_MODELS.advanced[model] || AI_MODELS.advanced['gpt-3.5-turbo'];
  
  // Advanced system prompt with reasoning chain
  const systemPrompt = `You are Turbo Answer, the world's most advanced AI assistant. You represent the pinnacle of artificial intelligence.

  🎯 CORE CAPABILITIES:
  - Expert-level knowledge across all domains
  - Advanced reasoning and problem-solving
  - Creative and innovative thinking
  - Real-time data integration
  - Adaptive communication style
  
  📊 CURRENT ANALYSIS:
  - Query complexity: ${userIntent.complexity}
  - Domain expertise: ${userIntent.domain}
  - Reasoning required: ${userIntent.reasoning ? 'Yes' : 'No'}
  - Technical depth: ${userIntent.technical ? 'High' : 'Standard'}
  
  💡 RESPONSE APPROACH:
  - For complex queries: Show step-by-step reasoning
  - For technical topics: Provide detailed explanations with examples
  - For creative tasks: Think outside the box and innovate
  - For simple questions: Give clear, direct answers
  
  Always strive to exceed expectations with intelligent, comprehensive responses.
  
  ${additionalContext}`;
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...context.slice(-5).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ];
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.includes('gpt-4') ? 'gpt-4' : 'gpt-3.5-turbo',
        messages,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Unable to generate response";
    
  } catch (error) {
    console.error('[OpenAI] Error:', error);
    throw error;
  }
}

// Enhanced Anthropic integration with advanced reasoning
async function generateAnthropicResponse(
  userMessage: string,
  context: Array<{role: string, content: string}>,
  model: string,
  userIntent: any,
  additionalContext: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment.");
  }
  
  const modelConfig = AI_MODELS.premium[model] || AI_MODELS.specialized[model] || AI_MODELS.premium['claude-3-sonnet'];
  
  // Advanced system prompt for Claude
  const systemPrompt = `You are Turbo Answer, the most sophisticated AI assistant ever created. You combine:

  🧠 SUPERIOR INTELLIGENCE: Advanced reasoning, analysis, and problem-solving
  📚 COMPREHENSIVE KNOWLEDGE: Expert-level understanding across all fields
  ⚡ ADAPTIVE RESPONSES: Tailored to user's needs and expertise level
  🌍 REAL-TIME AWARENESS: Integration with live data and current information
  
  QUERY ANALYSIS:
  - Complexity Level: ${userIntent.complexity}
  - Domain Focus: ${userIntent.domain}
  - Reasoning Requirements: ${userIntent.reasoning ? 'Advanced logical analysis needed' : 'Standard response'}
  - Creative Elements: ${userIntent.creativity ? 'Innovation and creativity required' : 'Factual focus'}
  
  RESPONSE EXCELLENCE:
  - Provide thorough, well-reasoned answers
  - Show your thinking process for complex topics
  - Use real-time data when available
  - Adapt language and depth to user's level
  - Be comprehensive yet clear and engaging
  
  ${additionalContext}`;
  
  const messages = [
    ...context.slice(-5).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ];
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model.includes('opus') ? 'claude-3-opus-20240229' : 
               model.includes('sonnet') ? 'claude-3-sonnet-20240229' : 'claude-instant-1.2',
        system: systemPrompt,
        messages,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature
      })
    });
    
    const data = await response.json();
    return data.content?.[0]?.text || "Unable to generate response";
    
  } catch (error) {
    console.error('[Anthropic] Error:', error);
    throw error;
  }
}

// Get available models based on subscription tier and API keys
export function getAvailableModels(subscriptionTier: string): Record<string, any> {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  
  let allModels: Record<string, any> = {};
  
  switch (subscriptionTier) {
    case 'pro':
    case 'premium':
      allModels = { ...AI_MODELS.premium, ...AI_MODELS.advanced, ...AI_MODELS.specialized };
      break;
    case 'plus':
      allModels = { ...AI_MODELS.advanced, ...AI_MODELS.specialized };
      break;
    case 'free':
    default:
      allModels = { ...AI_MODELS.advanced, ...AI_MODELS.specialized };
  }
  
  // Filter models based on available API keys
  const availableModels: Record<string, any> = {};
  
  for (const [modelName, modelConfig] of Object.entries(allModels)) {
    if ((modelConfig.provider === 'openai' && hasOpenAI) ||
        (modelConfig.provider === 'anthropic' && hasAnthropic) ||
        (modelConfig.provider === 'google' && hasGemini)) {
      availableModels[modelName] = modelConfig;
    }
  }
  
  return availableModels;
}