import type { Express, Request, Response } from "express";
import { openai } from "./client";

export function registerImageRoutes(app: Express): void {
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, size = "512x512", quality = "low" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const startTime = Date.now();

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: size as "1024x1024" | "512x512" | "256x256",
        quality: quality as "low" | "medium" | "high",
      });

      const elapsed = Date.now() - startTime;
      console.log(`[Image] Generated in ${elapsed}ms (size: ${size}, quality: ${quality})`);

      const imageData = response.data[0];
      res.json({
        url: imageData.url,
        b64_json: imageData.b64_json,
        generationTime: elapsed,
      });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });
}

