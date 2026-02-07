import { 
  getWeatherData, 
  getLocationInfo, 
  getWorldTimeInfo, 
  formatWeatherReport, 
  formatLocationReport,
  isWeatherQuery,
  isLocationQuery,
  isTimeZoneQuery,
  extractLocation,
  getTimeZoneInfo
} from "./weather-location";

export const AI_MODELS: Record<string, Record<string, any>> = {
  pro: {
    "gemini-pro": {
      name: "Gemini Pro",
      provider: "google",
      description: "Premium model for detailed responses and complex tasks",
      maxTokens: 8000,
      temperature: 0.3,
    },
  },
  research: {
    "claude-research": {
      name: "Gemini 2.5 Pro",
      provider: "google",
      description: "Most powerful model for deep research and comprehensive analysis",
      maxTokens: 16000,
      temperature: 0.1,
    },
  },
  free: {
    "gemini-flash": {
      name: "Gemini 2.5 Flash",
      provider: "google",
      description: "Fast free model for everyday questions",
      maxTokens: 4000,
      temperature: 0.4,
    },
  },
};

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}> = [],
  subscriptionTier: string = "free",
  selectedModel?: string,
  userId?: string,
  userLanguage: string = "en"
): Promise<string> {
  try {
    let additionalContext = "";
    let enhancedMessage = userMessage;

    if (isWeatherQuery(userMessage)) {
      const location = extractLocation(userMessage);
      if (location) {
        try {
          const weatherData = await getWeatherData(location);
          const weatherReport = formatWeatherReport(weatherData);
          additionalContext = `\n\nREAL-TIME WEATHER DATA:\n${weatherReport}`;
          enhancedMessage = `${userMessage}\n\n[Live weather data provided - use this current information in your response]`;
        } catch (error: any) {
          additionalContext = `\n\nWeather data unavailable: ${error.message}`;
        }
      }
    } else if (isLocationQuery(userMessage)) {
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
            enhancedMessage = `${userMessage}\n\n[Live location and time data provided]`;
          }
        } catch (error: any) {
          additionalContext = `\n\nLocation data unavailable: ${error.message}`;
        }
      }
    } else if (isTimeZoneQuery(userMessage)) {
      additionalContext = `\n\nTIME ZONE DATA:\n${getTimeZoneInfo()}`;
      enhancedMessage = `${userMessage}\n\n[Time zone reference provided]`;
    }

    const isSimple = userMessage.length < 50 || /\b(hi|hello|hey|thanks|ok|yes|no|turbo)\b/i.test(userMessage);
    const languageInstruction = userLanguage !== "en" ? 
      `CRITICAL: Respond in ${userLanguage} language. ALL responses must be in ${userLanguage}.` : "";

    let systemPrompt: string;
    let geminiModel: string;
    let maxTokens: number;
    let temperature: number;

    if (selectedModel === 'claude-research') {
      geminiModel = 'gemini-2.5-pro';
      maxTokens = 8000;
      temperature = 0.1;
      systemPrompt = `You are Turbo Answer, a research assistant. Give thorough, well-structured analysis with clear headings and evidence-based reasoning.${languageInstruction ? ' ' + languageInstruction : ''}${additionalContext}`;
    } else if (selectedModel === 'gemini-pro') {
      geminiModel = 'gemini-2.5-flash';
      maxTokens = isSimple ? 500 : 4000;
      temperature = 0.3;
      systemPrompt = isSimple
        ? `You are Turbo. Be concise and direct.${languageInstruction ? ' ' + languageInstruction : ''}`
        : `You are Turbo Answer, a premium assistant. Give clear, detailed responses.${languageInstruction ? ' ' + languageInstruction : ''}${additionalContext}`;
    } else {
      geminiModel = isSimple ? 'gemini-2.0-flash' : 'gemini-2.5-flash';
      maxTokens = isSimple ? 300 : 2000;
      temperature = 0.4;
      systemPrompt = isSimple
        ? `You are Turbo. Answer in 1-2 sentences max.${languageInstruction ? ' ' + languageInstruction : ''}`
        : `You are Turbo Answer. Give clear, helpful responses.${languageInstruction ? ' ' + languageInstruction : ''}${additionalContext}`;
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return "Gemini API key is not configured. Please add GEMINI_API_KEY to get started.";
    }

    console.log(`[AI] Model: ${geminiModel}, Tokens: ${maxTokens}`);

    const recentHistory = conversationHistory.slice(-2).map(m => `${m.role}: ${m.content.slice(0, 500)}`).join('\n');
    const fullPrompt = recentHistory
      ? `${systemPrompt}\n\nContext:\n${recentHistory}\n\nUser: ${enhancedMessage}`
      : `${systemPrompt}\n\nUser: ${enhancedMessage}`;

    return await callGemini(fullPrompt, geminiModel, maxTokens, temperature, geminiApiKey);

  } catch (error: any) {
    console.error('[AI] Error:', error.message);
    if (error.message?.includes('rate limit') || error.message?.includes('quota') || error.message?.includes('Rate') || error.message?.includes('429')) {
      return "I'm a bit busy right now - too many requests at once. Please wait a few seconds and try again!";
    }
    return "Something went wrong. Please try again in a moment.";
  }
}

async function callGemini(prompt: string, preferredModel: string, maxTokens: number, temperature: number, apiKey: string): Promise<string> {
  const fallback = preferredModel === 'gemini-2.5-pro' ? 'gemini-2.5-flash'
    : preferredModel === 'gemini-2.5-flash' ? 'gemini-2.0-flash'
    : null;
  const models = fallback ? [preferredModel, fallback] : [preferredModel];

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: maxTokens }
  });

  for (const model of models) {
    try {
      const start = Date.now();
      const controller = new AbortController();
      const timeoutMs = model.includes('2.0-flash') ? 10000 : 20000;
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestBody, signal: controller.signal }
      );
      clearTimeout(timeout);

      if (response.status === 429) {
        console.log(`[Gemini] ${model} rate limited, trying fallback...`);
        continue;
      }

      const data = await response.json();
      if (data.error) {
        console.error(`[Gemini] ${model} error:`, data.error.message);
        continue;
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      console.log(`[Gemini] ${model} responded in ${Date.now() - start}ms`);
      return content;

    } catch (error: any) {
      console.log(`[Gemini] ${model} failed: ${error.message}, trying next...`);
      continue;
    }
  }

  throw new Error('AI is temporarily busy. Please try again in a moment.');
}

async function callClaude(userMessage: string, systemPrompt: string, contextMessages: string, maxTokens: number, temperature: number, apiKey: string, baseUrl?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const messages: Array<{role: string, content: string}> = [];
    if (contextMessages) {
      messages.push({ role: "user", content: `Previous conversation context:\n${contextMessages}` });
      messages.push({ role: "assistant", content: "I understand the context. How can I help?" });
    }
    messages.push({ role: "user", content: userMessage });

    const apiUrl = baseUrl ? `${baseUrl}/v1/messages` : 'https://api.anthropic.com/v1/messages';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Claude] API error:', response.status, errorData);
      if (response.status === 429) {
        return "Claude is a bit busy right now. Please wait a few seconds and try again!";
      }
      throw new Error(errorData.error?.message || `Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new Error('No content received from Claude');
    }
    return content;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return "The research query took too long. Please try a simpler question or try again.";
    }
    throw error;
  }
}

export function getAvailableModels(subscriptionTier: string): Record<string, any> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasClaude = !!(process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY);

  const models: Record<string, any> = {};

  if (hasGemini) {
    Object.assign(models, AI_MODELS.free);
  }

  if (subscriptionTier === 'pro' || subscriptionTier === 'research') {
    if (hasGemini) Object.assign(models, AI_MODELS.pro);
  }

  if (subscriptionTier === 'research') {
    if (hasGemini) Object.assign(models, AI_MODELS.research);
  }

  return models;
}
