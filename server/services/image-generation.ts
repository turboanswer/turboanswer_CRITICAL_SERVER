// Image generation service using OpenAI DALL-E
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ImageGenerationRequest {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  revisedPrompt?: string;
  error?: string;
}

export class ImageGenerationService {
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      // Clean and validate the prompt
      const cleanPrompt = request.prompt.trim();
      if (cleanPrompt.length < 5) {
        return {
          success: false,
          error: "Image prompt is too short. Please provide more details."
        };
      }

      // Ensure prompt doesn't exceed OpenAI's limits
      const maxPromptLength = 1000;
      const finalPrompt = cleanPrompt.length > maxPromptLength 
        ? cleanPrompt.substring(0, maxPromptLength) 
        : cleanPrompt;

      console.log(`[Image Generation] Generating image with prompt: "${finalPrompt}"`);

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        n: 1, // DALL-E 3 only supports n=1
        size: request.size || "1024x1024",
        quality: request.quality || "standard",
        style: request.style || "vivid",
      });

      const imageData = response.data[0];
      
      console.log(`[Image Generation] Successfully generated image: ${imageData.url}`);
      
      return {
        success: true,
        imageUrl: imageData.url,
        revisedPrompt: imageData.revised_prompt || finalPrompt,
      };
    } catch (error: any) {
      console.error("Image generation error:", error);
      
      // Handle specific OpenAI API errors
      if (error.type === 'content_policy_violation' || error.code === 'content_policy_violation') {
        return {
          success: false,
          error: "Image request violates content policy. Please try a different prompt."
        };
      } else if (error.type === 'rate_limit_exceeded' || error.code === 'rate_limit_exceeded') {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again in a moment."
        };
      } else if (error.type === 'insufficient_quota' || error.code === 'insufficient_quota') {
        return {
          success: false,
          error: "API quota exceeded. Please check your OpenAI account."
        };
      } else if (error.type === 'image_generation_user_error') {
        return {
          success: false,
          error: "Invalid image request. Please try a different prompt or check your settings."
        };
      } else if (error.status === 400) {
        return {
          success: false,
          error: "Invalid request format. Please try a simpler prompt."
        };
      } else if (error.status === 401) {
        return {
          success: false,
          error: "Invalid OpenAI API key. Please check your credentials."
        };
      } else {
        return {
          success: false,
          error: `Image generation failed: ${error.message || 'Please try again with a different prompt'}`
        };
      }
    }
  }

  async isImageGenerationRequest(message: string): Promise<boolean> {
    // Detect image generation requests
    const imageKeywords = [
      /\b(generate|create|make|draw|design|build)\s+(an?\s+)?(image|picture|photo|artwork|illustration|drawing|painting|sketch|graphic|visual)\b/i,
      /\b(show me|give me|I want|can you make)\s+.*\b(image|picture|photo|artwork|illustration|drawing|painting)\b/i,
      /\b(draw|paint|sketch|illustrate|visualize|render)\s+/i,
      /\bimage of\b/i,
      /\bpicture of\b/i,
      /\b(dalle|dall-e|dall e)\b/i,
      /\b(art|artwork|digital art)\s+(of|depicting|showing)\b/i,
      /\b(generate|create).*visual/i,
      /\bI need.*image/i,
      /\bcan you draw/i,
      /\bshow.*visually/i
    ];

    return imageKeywords.some(pattern => pattern.test(message));
  }

  extractImagePrompt(message: string): string {
    // Extract the actual image description from the user's message
    const cleanMessage = message
      .replace(/\b(generate|create|make|draw|design|build|show me|give me|I want|can you make)\s+(an?\s+)?(image|picture|photo|artwork|illustration|drawing|painting|sketch|graphic|visual)\s+(of\s+)?/i, '')
      .replace(/\b(draw|paint|sketch|illustrate|visualize|render)\s+/i, '')
      .replace(/\bimage of\s+/i, '')
      .replace(/\bpicture of\s+/i, '')
      .replace(/\b(dalle|dall-e|dall e)\s*/i, '')
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
      quality: "hd",
      style: "vivid"
    });

    if (result.success && result.imageUrl) {
      return `I've created an image for you! Here it is:

![Generated Image](${result.imageUrl})

**Prompt used:** ${result.revisedPrompt}

The image should appear above. If you'd like me to generate another version or make changes, just let me know!`;
    } else {
      return `I'm sorry, I couldn't generate the image. ${result.error || 'Please try again with a different description.'}`;
    }
  }
}

export const imageGeneration = new ImageGenerationService();