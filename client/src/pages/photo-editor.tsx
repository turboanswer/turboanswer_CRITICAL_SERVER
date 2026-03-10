import { useState, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Camera, Upload, X, Loader2, Copy, CheckCircle, ScanText, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/hooks/use-theme";

export default function AIScanner() {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setImageData(data);
      setImagePreview(data);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageData(null);
    setImagePreview(null);
    setResult(null);
    setQuestion("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function analyze() {
    if (!imageData) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const res = await apiRequest("POST", "/api/camera/analyze", {
        imageData,
        question: question.trim() || undefined,
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }

  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const bg = isDark ? "bg-[#030014]" : "bg-gray-50";
  const card = isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200";
  const text = isDark ? "text-white" : "text-gray-900";
  const subtext = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b px-4 py-3 flex items-center gap-3 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-200"}`}>
        <Link href="/chat">
          <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${subtext}`}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <ScanText className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-base">AI Scanner</span>
        </div>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"} border ${isDark ? "border-blue-500/30" : "border-blue-200"}`}>
          Powered by Gemini
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Intro card — shown when no image selected */}
        {!imagePreview && (
          <div className={`rounded-2xl border p-6 text-center ${card}`}>
            <ScanText className="h-12 w-12 mx-auto mb-3 text-blue-500 opacity-80" />
            <h2 className={`text-lg font-bold mb-1 ${text}`}>Scan anything with AI</h2>
            <p className={`text-sm mb-6 ${subtext}`}>
              Take a photo or upload an image — receipts, notes, documents, signs, menus, whiteboards — and the AI will read and summarize it instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Camera className="h-4 w-4" />
                Take a Photo
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className={`gap-2 ${isDark ? "border-zinc-700 text-gray-300 hover:bg-zinc-800" : ""}`}
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
            </div>
          </div>
        )}

        {/* Image preview + controls */}
        {imagePreview && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className="relative">
              <img
                src={imagePreview}
                alt="Captured"
                className="w-full max-h-80 object-contain bg-black"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className={`text-xs font-medium mb-1.5 block ${subtext}`}>
                  Ask something specific (optional)
                </label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What does this document say? How much is the total? Translate this text..."
                  rows={2}
                  className={`text-sm resize-none ${inputBg} rounded-xl border`}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={analyze}
                  disabled={isAnalyzing}
                  className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><ScanText className="h-4 w-4" /> Analyze</>
                  )}
                </Button>
                <Button
                  onClick={clearImage}
                  variant="outline"
                  className={`gap-2 ${isDark ? "border-zinc-700 text-gray-300 hover:bg-zinc-800" : ""}`}
                >
                  <RefreshCw className="h-4 w-4" />
                  New
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl border ${card}`}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">AI Analysis</span>
              </div>
              <button
                onClick={copyResult}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                  isDark ? "hover:bg-zinc-800 text-gray-400 hover:text-gray-200" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className={`px-4 pb-4 text-sm leading-relaxed whitespace-pre-wrap ${subtext}`}>
              {result}
            </div>
          </div>
        )}

        {/* Tips chips */}
        {!imagePreview && (
          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className={`text-xs font-semibold mb-2 ${subtext}`}>Works great with:</p>
            <div className="flex flex-wrap gap-2">
              {["Documents & PDFs", "Receipts & invoices", "Handwritten notes", "Signs & menus", "Whiteboards", "Books & articles", "Product labels", "Business cards"].map((tip) => (
                <span key={tip} className={`text-xs px-2.5 py-1 rounded-full border ${isDark ? "border-zinc-700 text-gray-400 bg-zinc-800/50" : "border-gray-200 text-gray-500 bg-gray-50"}`}>
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
