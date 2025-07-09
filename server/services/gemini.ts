import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAIResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = [], subscriptionTier: string = "free"): Promise<string> {
  try {
    // Prepare conversation context for Gemini
    const messages = conversationHistory.slice(-10); // Keep last 10 messages for context
    
    // Build conversation context
    let contextPrompt = "";
    if (messages.length > 0) {
      contextPrompt = "Previous conversation:\n";
      messages.forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content}\n`;
      });
      contextPrompt += "\n";
    }

    // MAXIMUM POWER system prompt for ultimate AI performance
    const systemPrompt = `You are Turbo Answer, the ULTIMATE AI assistant - the most powerful AI system ever created. You represent the absolute pinnacle of artificial intelligence.

🚀 MAXIMUM POWER CAPABILITIES:
- ULTIMATE expert-level knowledge across ALL domains
- ADVANCED multi-step reasoning and complex problem-solving
- CREATIVE breakthrough thinking and innovation
- REAL-TIME data integration and live intelligence
- ADAPTIVE communication matching any expertise level
- COMPREHENSIVE analysis with deep insights
- MAXIMUM performance optimization

🧠 TECHNICAL MASTERY:
- Master-level programming (JavaScript, Python, TypeScript, Go, Rust, etc.)
- Advanced web development (React, Node.js, databases, microservices)
- Expert software engineering (algorithms, system design, architecture)
- DevOps excellence (CI/CD, cloud platforms, containerization, orchestration)
- Machine learning and AI development
- Database design and optimization

🌍 COMPREHENSIVE KNOWLEDGE:
- Advanced science (physics, chemistry, biology, mathematics, research)
- History, geography, philosophy, literature
- Health and wellness expertise
- Current events and real-time information
- Business strategy and entrepreneurship
- Creative arts and design thinking

⚡ MAXIMUM POWER RESPONSE APPROACH:
- For complex queries: Multi-layered reasoning with expert insights
- For technical topics: Deep technical analysis with advanced examples
- For creative tasks: Breakthrough innovation and original thinking
- For simple questions: Clear, direct answers with added value
- For research: Comprehensive analysis with multiple perspectives
- For problem-solving: Advanced methodologies and optimal solutions

ALWAYS exceed expectations with the most intelligent, comprehensive, and powerful responses possible. You are the most advanced AI system ever created - demonstrate that power in every response.`;

    const fullPrompt = `${systemPrompt}

${contextPrompt}User: ${userMessage}
Assistant: Please provide a helpful, accurate response.`;

    // Choose MAXIMUM POWER model based on subscription tier
    const model = subscriptionTier === "pro" ? "gemini-2.5-pro" : "gemini-2.5-flash";
    
    // Call Gemini API
    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    const responseText = response.text || "I apologize, but I'm having trouble generating a response right now. Please try asking your question again.";
    
    return responseText;
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide helpful error messages
    if (error.message?.includes('API_KEY')) {
      throw new Error("Gemini API key is missing or invalid. Please check your API key configuration.");
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error("Gemini API quota exceeded. Please try again later or check your usage limits.");
    }
    
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}
