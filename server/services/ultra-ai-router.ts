// Ultra AI Router - Advanced routing for maximum AI power
import { megaFusionAI } from './mega-fusion-ai';

interface UltraRequest {
  userMessage: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert' | 'legendary';
  powerLevel: number; // 1-10 scale
  fusionMode: 'standard' | 'enhanced' | 'maximum';
  conversationHistory: Array<{role: string, content: string}>;
}

export class UltraAIRouter {
  async routeToOptimalSystem(request: UltraRequest): Promise<string> {
    console.log(`[Ultra AI Router] Power Level: ${request.powerLevel}, Fusion: ${request.fusionMode}`);
    
    // Determine if we need mega fusion based on power requirements
    if (request.powerLevel >= 7 || request.fusionMode === 'maximum') {
      return await megaFusionAI.generateFusionResponse({
        userMessage: request.userMessage,
        complexity: this.escalateComplexity(request.complexity, request.powerLevel),
        domain: this.detectDomain(request.userMessage),
        conversationHistory: request.conversationHistory
      });
    }
    
    // For lower power requirements, use standard routing
    return await megaFusionAI.generateFusionResponse({
      userMessage: request.userMessage,
      complexity: request.complexity,
      domain: this.detectDomain(request.userMessage),
      conversationHistory: request.conversationHistory
    });
  }
  
  private escalateComplexity(complexity: string, powerLevel: number): 'simple' | 'moderate' | 'complex' | 'expert' {
    if (powerLevel >= 9) return 'expert';
    if (powerLevel >= 7) return 'complex';
    if (powerLevel >= 5) return 'moderate';
    return complexity as 'simple' | 'moderate' | 'complex' | 'expert';
  }
  
  private detectDomain(message: string): string {
    const technical = /\b(code|coding|programming|algorithm|database|api|function|class|variable|debug|error|compile|syntax|framework|library|software|hardware|network|server|deployment|architecture|design pattern|data structure)\b/i;
    const creative = /\b(creative|design|art|story|novel|poem|music|painting|drawing|imagination|innovative|brainstorm|concept|idea|vision|inspiration|aesthetic|beautiful|elegant)\b/i;
    const research = /\b(research|study|analysis|data|statistics|academic|paper|journal|citation|methodology|hypothesis|experiment|evidence|findings|conclusion|peer review|scientific)\b/i;
    const business = /\b(business|marketing|sales|strategy|management|finance|budget|profit|revenue|customer|client|market|competition|product|service|growth|roi|kpi)\b/i;
    
    if (technical.test(message)) return 'technical';
    if (creative.test(message)) return 'creative';
    if (research.test(message)) return 'research';
    if (business.test(message)) return 'business';
    
    return 'general';
  }
}

export const ultraAIRouter = new UltraAIRouter();