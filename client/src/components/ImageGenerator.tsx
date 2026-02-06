import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ImageIcon, Download, Loader2, X, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
  onClose?: () => void;
}

export function ImageGenerator({ onImageGenerated, onClose }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(prev => prev + 100), 100);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const generateMutation = useMutation({
    mutationFn: async (imagePrompt: string) => {
      startTimer();
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, size: "512x512", quality: "low" }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
      }
      return response.json();
    },
    onSuccess: (data) => {
      stopTimer();
      const imageUrl = data.b64_json
        ? `data:image/png;base64,${data.b64_json}`
        : data.url;
      setGeneratedImage(imageUrl);
      onImageGenerated?.(imageUrl, prompt);
      const serverTime = data.generationTime ? `${(data.generationTime / 1000).toFixed(1)}s` : `${(elapsed / 1000).toFixed(1)}s`;
      toast({ title: "Image Created", description: `Generated in ${serverTime}` });
    },
    onError: (error: Error) => {
      stopTimer();
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate(prompt.trim());
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `turbo-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">AI Image Creator</h3>
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" /> Turbo Speed Mode
            </p>
          </div>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city at sunset with flying cars..."
          className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 text-sm min-h-[60px] max-h-[100px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />

        <div className="flex gap-2 flex-wrap">
          {["A cute robot", "Sunset landscape", "Abstract art", "Space scene"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generateMutation.isPending}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
        >
          {generateMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating... {(elapsed / 1000).toFixed(1)}s</span>
            </div>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {generatedImage && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-zinc-700">
            <img
              src={generatedImage}
              alt={prompt}
              className="w-full h-auto max-h-[400px] object-contain bg-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => { setGeneratedImage(null); setPrompt(""); }}
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              Create Another
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
