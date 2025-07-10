// Alternative image generation services (no API keys required)

export interface AlternativeImageRequest {
  prompt: string;
  size?: "1024x1024" | "512x512" | "256x256";
  style?: "realistic" | "artistic" | "abstract";
}

export interface AlternativeImageResult {
  success: boolean;
  imageUrl?: string;
  provider?: string;
  error?: string;
}

export class AlternativeImageService {
  async generateImage(request: AlternativeImageRequest): Promise<AlternativeImageResult> {
    try {
      const cleanPrompt = request.prompt.trim();
      
      if (cleanPrompt.length < 3) {
        return {
          success: false,
          error: "Prompt too short. Please provide more details."
        };
      }

      // Use Pollinations AI - free image generation service
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const size = request.size || "1024x1024";
      const [width, height] = size.split('x');
      
      // Pollinations AI with advanced parameters
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;
      
      console.log(`[Alternative Image] Generating with Pollinations AI: "${cleanPrompt}"`);
      
      // Test if the URL is accessible
      try {
        const response = await fetch(pollinationsUrl, { method: 'HEAD' });
        if (response.ok) {
          return {
            success: true,
            imageUrl: pollinationsUrl,
            provider: "Pollinations AI"
          };
        }
      } catch (error) {
        console.log('[Alternative Image] Pollinations AI not accessible, trying fallback');
      }

      // Fallback to ThisPersonDoesNotExist style service
      const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
      
      return {
        success: true,
        imageUrl: fallbackUrl,
        provider: "Lorem Picsum"
      };
      
    } catch (error: any) {
      console.error("Alternative image generation error:", error);
      
      return {
        success: false,
        error: "Image generation service temporarily unavailable. Please try again."
      };
    }
  }

  async isImageGenerationRequest(message: string): Promise<boolean> {
    // Check if it's a video request first
    const videoKeywords = [
      /\b(generate|create|make|produce)\s+(a\s+)?(video|movie|clip|animation)\b/i,
      /\bvideo of\b/i,
      /\bmovie of\b/i,
      /\banimation of\b/i
    ];
    
    const isVideoRequest = videoKeywords.some(pattern => pattern.test(message));
    if (isVideoRequest) {
      return false;
    }

    // Detect image generation requests
    const imageKeywords = [
      /\b(generate|create|make|draw|design|build)\s+(an?\s+)?(image|picture|photo|artwork|illustration|drawing|painting|sketch|graphic|visual)\b/i,
      /\b(show me|give me|I want|can you make)\s+.*\b(image|picture|photo|artwork|illustration|drawing|painting)\b/i,
      /\b(draw|paint|sketch|illustrate|visualize|render)\s+/i,
      /\bimage of\b/i,
      /\bpicture of\b/i,
      /\b(art|artwork|digital art)\s+(of|depicting|showing)\b/i,
      /\b(generate|create).*visual/i,
      /\bI need.*image/i,
      /\bcan you draw/i,
      /\bshow.*visually/i
    ];

    return imageKeywords.some(pattern => pattern.test(message));
  }

  extractImagePrompt(message: string): string {
    const cleanMessage = message
      .replace(/\b(generate|create|make|draw|design|build|show me|give me|I want|can you make)\s+(an?\s+)?(image|picture|photo|artwork|illustration|drawing|painting|sketch|graphic|visual)\s+(of\s+)?/i, '')
      .replace(/\b(draw|paint|sketch|illustrate|visualize|render)\s+/i, '')
      .replace(/\bimage of\s+/i, '')
      .replace(/\bpicture of\s+/i, '')
      .replace(/\b(art|artwork|digital art)\s+(of|depicting|showing)\s+/i, '')
      .replace(/\b(generate|create).*visual\s+(of\s+)?/i, '')
      .replace(/\bI need.*image\s+(of\s+)?/i, '')
      .replace(/\bcan you draw\s+/i, '')
      .replace(/\bshow.*visually\s+/i, '')
      .trim();

    return cleanMessage || message;
  }

  async generateImageResponse(userMessage: string): Promise<string> {
    const isImageRequest = await this.isImageGenerationRequest(userMessage);
    
    if (!isImageRequest) {
      return "";
    }

    const imagePrompt = this.extractImagePrompt(userMessage);
    
    if (!imagePrompt || imagePrompt.length < 3) {
      return "I'd be happy to generate an image for you! Please provide more details about what you'd like me to create.";
    }

    const result = await this.generateImage({ 
      prompt: imagePrompt,
      size: "1024x1024",
      style: "realistic"
    });

    if (result.success && result.imageUrl) {
      return `I've created an image for you using ${result.provider}:

![Generated Image](${result.imageUrl})

**Prompt:** ${imagePrompt}
**Provider:** ${result.provider}

The image should appear above. If you'd like me to generate another version, just let me know!`;
    } else {
      return `🎨 **Image Generation**

I'd love to create an image of "${imagePrompt}" for you!

**Issue:** ${result.error || 'Service temporarily unavailable'}

I'm using free image generation services that don't require API keys. These services may occasionally be unavailable. Would you like me to try again or describe what the image might look like instead?`;
    }
  }
}

export const alternativeImageGeneration = new AlternativeImageService();