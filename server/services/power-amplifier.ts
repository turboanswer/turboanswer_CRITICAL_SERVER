// Power Amplifier - Boosts AI capabilities beyond normal limits
import { megaFusionAI } from './mega-fusion-ai';

interface PowerRequest {
  userMessage: string;
  requestedPowerLevel: number; // 1-10 scale
  useUltimateMode: boolean;
  conversationHistory: Array<{role: string, content: string}>;
}

export class PowerAmplifier {
  async amplifyResponse(request: PowerRequest): Promise<string> {
    console.log(`[Power Amplifier] Requested power level: ${request.requestedPowerLevel}/10`);
    
    // Determine complexity based on power level
    let complexity: 'simple' | 'moderate' | 'complex' | 'expert' = 'simple';
    if (request.requestedPowerLevel >= 8) complexity = 'expert';
    else if (request.requestedPowerLevel >= 6) complexity = 'complex';
    else if (request.requestedPowerLevel >= 4) complexity = 'moderate';
    
    // Override complexity for ultimate mode
    if (request.useUltimateMode) {
      complexity = 'expert';
      console.log(`[Power Amplifier] ULTIMATE MODE ACTIVATED - Maximum fusion power`);
    }
    
    // Detect domain for optimal model selection
    const domain = this.detectAdvancedDomain(request.userMessage);
    
    try {
      const response = await megaFusionAI.generateFusionResponse({
        userMessage: request.userMessage,
        complexity,
        domain,
        conversationHistory: request.conversationHistory
      });
      
      // Add power amplification indicators
      if (request.useUltimateMode || request.requestedPowerLevel >= 8) {
        return this.addPowerIndicators(response, request.requestedPowerLevel, complexity);
      }
      
      return response;
    } catch (error) {
      console.error('[Power Amplifier] Error:', error);
      return `**🔴 Power Amplifier Error**: ${error.message}`;
    }
  }
  
  private detectAdvancedDomain(message: string): string {
    const patterns = {
      'ai-research': /\b(artificial intelligence|machine learning|neural network|deep learning|llm|language model|ai model|gpt|claude|gemini|training|inference|transformer|attention|embedding)\b/i,
      'quantum': /\b(quantum|qubit|superposition|entanglement|quantum computing|quantum mechanics|quantum physics|quantum algorithm)\b/i,
      'blockchain': /\b(blockchain|cryptocurrency|bitcoin|ethereum|smart contract|defi|nft|web3|crypto|decentralized)\b/i,
      'biotech': /\b(biotechnology|genetics|dna|rna|protein|genome|crispr|gene editing|bioinformatics|molecular biology)\b/i,
      'space': /\b(space|rocket|satellite|mars|moon|astronaut|nasa|spacex|orbit|galaxy|universe|cosmos|astronomy)\b/i,
      'advanced-math': /\b(calculus|differential|integral|matrix|vector|topology|algebra|geometry|statistics|probability|theorem|proof)\b/i,
      'philosophy': /\b(philosophy|consciousness|existence|meaning|ethics|morality|metaphysics|epistemology|ontology|logic)\b/i,
      'technical': /\b(code|programming|algorithm|database|api|software|hardware|network|server|framework|architecture)\b/i,
      'creative': /\b(creative|design|art|story|music|painting|imagination|innovative|concept|aesthetic)\b/i,
      'research': /\b(research|study|analysis|academic|scientific|methodology|hypothesis|evidence|peer review)\b/i,
      'business': /\b(business|marketing|strategy|finance|management|revenue|customer|market|growth)\b/i
    };
    
    for (const [domain, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        console.log(`[Power Amplifier] Detected specialized domain: ${domain}`);
        return domain;
      }
    }
    
    return 'general';
  }
  
  private addPowerIndicators(response: string, powerLevel: number, complexity: string): string {
    const powerEmoji = this.getPowerEmoji(powerLevel);
    const complexityBadge = this.getComplexityBadge(complexity);
    
    return `${powerEmoji} **POWER AMPLIFIED** ${complexityBadge}

${response}

---
**🔋 Power Level:** ${powerLevel}/10 | **⚡ Complexity:** ${complexity.toUpperCase()} | **🚀 System:** MEGA FUSION AI ULTIMATE`;
  }
  
  private getPowerEmoji(level: number): string {
    if (level >= 9) return '🔥💫⚡';
    if (level >= 7) return '🔥⚡';
    if (level >= 5) return '⚡';
    return '💫';
  }
  
  private getComplexityBadge(complexity: string): string {
    const badges = {
      'simple': '🟢 STANDARD',
      'moderate': '🟡 ENHANCED',
      'complex': '🟠 ULTRA',
      'expert': '🔴 MAXIMUM'
    };
    return badges[complexity] || '🟢 STANDARD';
  }
}

export const powerAmplifier = new PowerAmplifier();