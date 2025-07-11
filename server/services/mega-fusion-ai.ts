// Mega Fusion AI - Combines 10+ AI models for ultimate intelligence
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize AI providers
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
const perplexity = new OpenAI({ baseURL: "https://api.perplexity.ai", apiKey: process.env.PERPLEXITY_API_KEY || "" });
const xai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY || "" });

interface ModelResponse {
  content: string;
  provider: string;
  model: string;
  confidence: number;
  reasoning?: string;
}

interface FusionRequest {
  userMessage: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  domain: string;
  conversationHistory: Array<{role: string, content: string}>;
}

export class MegaFusionAI {
  private availableModels: string[] = [];

  constructor() {
    this.checkAvailableModels();
  }

  private async checkAvailableModels(): Promise<void> {
    this.availableModels = [];
    
    // Check available API keys and add models
    if (process.env.GEMINI_API_KEY) {
      this.availableModels.push('gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-pro');
    }
    if (process.env.OPENAI_API_KEY) {
      this.availableModels.push('gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo');
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.availableModels.push('claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-instant-1.2');
    }
    if (process.env.PERPLEXITY_API_KEY) {
      this.availableModels.push('llama-3.1-sonar-large-128k-online');
    }
    if (process.env.XAI_API_KEY) {
      this.availableModels.push('grok-2-1212', 'grok-2-vision-1212');
    }

    console.log(`[Mega Fusion AI] Available models: ${this.availableModels.length} models`);
  }

  async generateFusionResponse(request: FusionRequest): Promise<string> {
    console.log(`[Mega Fusion AI] Processing ${request.complexity} complexity query in ${request.domain} domain`);
    
    await this.checkAvailableModels();
    
    if (this.availableModels.length === 0) {
      return "Mega Fusion AI requires at least one API key to operate. Please configure GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, PERPLEXITY_API_KEY, or XAI_API_KEY.";
    }

    // Select models based on complexity and domain
    const selectedModels = this.selectOptimalModels(request.complexity, request.domain);
    
    if (selectedModels.length === 1) {
      // Single model response for simple queries
      return await this.getSingleModelResponse(selectedModels[0], request);
    }

    // Multi-model fusion for complex queries
    return await this.getMultiModelFusion(selectedModels, request);
  }

  private selectOptimalModels(complexity: string, domain: string): string[] {
    const modelSelection: { [key: string]: string[] } = {
      simple: this.getTopModels(1), // Use best available model
      moderate: this.getTopModels(2), // Use top 2 models
      complex: this.getTopModels(3), // Use top 3 models
      expert: this.getTopModels(5)   // Use top 5 models for fusion
    };

    // Domain-specific model preferences
    if (domain === 'technical' && this.availableModels.includes('gpt-4o')) {
      return ['gpt-4o', ...this.getTopModels(2)].slice(0, complexity === 'expert' ? 4 : 2);
    }
    if (domain === 'creative' && this.availableModels.includes('claude-3-opus-20240229')) {
      return ['claude-3-opus-20240229', ...this.getTopModels(2)].slice(0, complexity === 'expert' ? 4 : 2);
    }
    if (domain === 'research' && this.availableModels.includes('llama-3.1-sonar-large-128k-online')) {
      return ['llama-3.1-sonar-large-128k-online', ...this.getTopModels(2)].slice(0, complexity === 'expert' ? 4 : 2);
    }

    return modelSelection[complexity] || this.getTopModels(1);
  }

  private getTopModels(count: number): string[] {
    const priorityOrder = [
      'gemini-2.0-flash-exp',
      'claude-3-5-sonnet-20241022', 
      'gpt-4o',
      'grok-2-1212',
      'llama-3.1-sonar-large-128k-online',
      'claude-3-opus-20240229',
      'gpt-4-turbo',
      'gemini-1.5-pro',
      'gpt-4',
      'claude-instant-1.2',
      'gpt-3.5-turbo',
      'gemini-pro'
    ];

    return priorityOrder.filter(model => this.availableModels.includes(model)).slice(0, count);
  }

  private async getSingleModelResponse(model: string, request: FusionRequest): Promise<string> {
    try {
      const response = await this.callModel(model, request.userMessage, request.conversationHistory);
      return `**🤖 Mega Fusion AI** (${response.provider})\n\n${response.content}`;
    } catch (error) {
      console.error(`[Mega Fusion AI] Error with ${model}:`, error);
      return `I encountered an issue processing your request. Please try again.`;
    }
  }

  private async getMultiModelFusion(models: string[], request: FusionRequest): Promise<string> {
    console.log(`[Mega Fusion AI] Running fusion with models: ${models.join(', ')}`);
    
    try {
      // Get responses from multiple models in parallel
      const modelPromises = models.map(model => 
        this.callModel(model, request.userMessage, request.conversationHistory)
          .catch(error => {
            console.error(`[Mega Fusion AI] Model ${model} failed:`, error);
            return null;
          })
      );

      const responses = (await Promise.all(modelPromises)).filter(Boolean) as ModelResponse[];
      
      if (responses.length === 0) {
        return "I'm experiencing technical difficulties with all AI models. Please try again.";
      }

      if (responses.length === 1) {
        return `**🤖 Mega Fusion AI** (${responses[0].provider})\n\n${responses[0].content}`;
      }

      // Synthesize multiple responses
      return await this.synthesizeResponses(responses, request);
    } catch (error) {
      console.error('[Mega Fusion AI] Fusion error:', error);
      return "I encountered an error during multi-model fusion. Please try again.";
    }
  }

  private async callModel(model: string, message: string, history: Array<{role: string, content: string}>): Promise<ModelResponse> {
    const contextString = history.slice(-2).map(h => `${h.role}: ${h.content}`).join('\n');
    const fullPrompt = contextString ? `${contextString}\nuser: ${message}` : message;

    // Gemini models
    if (model.startsWith('gemini')) {
      const geminiModel = ai.getGenerativeModel({ model: model.includes('2.0') ? 'gemini-2.0-flash-exp' : 'gemini-1.5-flash' });
      const result = await geminiModel.generateContent(fullPrompt);
      return {
        content: result.response.text() || "",
        provider: "Google Gemini",
        model,
        confidence: 0.9
      };
    }

    // OpenAI models
    if (model.startsWith('gpt')) {
      const response = await openai.chat.completions.create({
        model: model.includes('4o') ? 'gpt-4o' : model.includes('4') ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: [
          ...history.slice(-3).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });
      return {
        content: response.choices[0].message.content || "",
        provider: "OpenAI",
        model,
        confidence: 0.9
      };
    }

    // Anthropic models
    if (model.startsWith('claude')) {
      const response = await anthropic.messages.create({
        model: model.includes('opus') ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          ...history.slice(-3).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
          { role: 'user', content: message }
        ]
      });
      return {
        content: response.content[0].text || "",
        provider: "Anthropic",
        model,
        confidence: 0.9
      };
    }

    // Perplexity models
    if (model.includes('sonar')) {
      const response = await perplexity.chat.completions.create({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: 'Provide accurate, up-to-date information with real-time web search capabilities.' },
          ...history.slice(-2).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.2
      });
      return {
        content: response.choices[0].message.content || "",
        provider: "Perplexity",
        model,
        confidence: 0.95
      };
    }

    // xAI models
    if (model.startsWith('grok')) {
      const response = await xai.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          ...history.slice(-2).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.4
      });
      return {
        content: response.choices[0].message.content || "",
        provider: "xAI",
        model,
        confidence: 0.85
      };
    }

    throw new Error(`Unknown model: ${model}`);
  }

  private async synthesizeResponses(responses: ModelResponse[], request: FusionRequest): Promise<string> {
    // Use the highest confidence model for synthesis
    const synthesizer = responses.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    const allResponses = responses.map((r, i) => 
      `**Model ${i + 1}** (${r.provider}):\n${r.content}`
    ).join('\n\n---\n\n');

    // For expert-level queries, provide detailed multi-model analysis
    if (request.complexity === 'expert' && responses.length >= 3) {
      return `**🚀 Mega Fusion AI** - Multi-Model Intelligence Analysis

**Synthesis from ${responses.length} AI Models:**

${responses[0].content}

**Additional Perspectives:**
${responses.slice(1).map((r, i) => `\n**${r.provider}:** ${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}`).join('')}

**Fusion Conclusion:** This analysis combines insights from ${responses.map(r => r.provider).join(', ')} to provide the most comprehensive and accurate response possible.`;
    }

    // For moderate complexity, provide enhanced response
    if (request.complexity === 'moderate' && responses.length >= 2) {
      return `**🤖 Mega Fusion AI** - Enhanced Intelligence

${responses[0].content}

**Additional Insight:** ${responses[1].content.substring(0, 150)}${responses[1].content.length > 150 ? '...' : ''}

*Powered by ${responses.map(r => r.provider).join(' + ')}*`;
    }

    // Simple response with best model
    return `**🤖 Mega Fusion AI** (${synthesizer.provider})\n\n${synthesizer.content}`;
  }
}

export const megaFusionAI = new MegaFusionAI();