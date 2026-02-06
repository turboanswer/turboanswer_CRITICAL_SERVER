import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, Monitor, Volume2, VolumeX, Eye, Loader2, MonitorPlay, Crosshair, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onAnalyze: (imageData: string) => void;
  isAnalyzing: boolean;
  language: string;
  onContinuousMode: (enabled: boolean) => void;
  continuousMode: boolean;
}

type SourceMode = 'camera' | 'screen';

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function CameraCapture({ 
  onCapture, 
  onAnalyze, 
  isAnalyzing: externalAnalyzing, 
  language,
  onContinuousMode,
  continuousMode
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('camera');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [blueDetected, setBlueDetected] = useState(false);
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingStream && videoRef.current) {
      videoRef.current.srcObject = pendingStream;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
      setPendingStream(null);
    }
  }, [pendingStream, isActive]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (isActive && continuousMode && videoReady) {
      startContinuousAnalysis();
    } else {
      stopContinuousAnalysis();
    }
  }, [continuousMode, isActive, videoReady]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopContinuousAnalysis();
    setIsActive(false);
    setVideoReady(false);
    setSelection(null);
    setSelectMode(false);
  };

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  const startCamera = async () => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setSourceMode('camera');
      setError(null);
      setIsActive(true);
      setPendingStream(stream);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please allow camera access.');
    }
  };

  const startScreenShare = async () => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } } as any,
        audio: false
      });
      stream.getVideoTracks()[0].onended = () => {
        stopStream();
      };
      streamRef.current = stream;
      setSourceMode('screen');
      setError(null);
      setIsActive(true);
      setPendingStream(stream);
      toast({ title: "Screen Sharing Active", description: "Use Select tool or mark blue to analyze content." });
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Screen sharing was cancelled or denied.');
    }
  };

  const detectBlueHighlight = useCallback((canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return false;
    const sampleSize = 100;
    let blueCount = 0;
    const total = sampleSize * sampleSize;
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let sy = 0; sy < sampleSize; sy++) {
      for (let sx = 0; sx < sampleSize; sx++) {
        const px = Math.floor((sx / sampleSize) * w);
        const py = Math.floor((sy / sampleSize) * h);
        const i = (py * w + px) * 4;
        const r = imgData.data[i], g = imgData.data[i+1], b = imgData.data[i+2];
        if (b > 150 && b > r * 1.5 && b > g * 1.3) blueCount++;
      }
    }
    return (blueCount / total) > 0.005;
  }, []);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const langMap: Record<string, string> = { en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'pt', ja: 'ja', ko: 'ko', zh: 'zh' };
    const langCode = langMap[language] || 'en';
    const preferredVoice = voices.find(v => v.lang.startsWith(langCode) && v.name.toLowerCase().includes('natural'))
      || voices.find(v => v.lang.startsWith(langCode) && v.name.toLowerCase().includes('google'))
      || voices.find(v => v.lang.startsWith(langCode));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const analyzeFrame = useCallback(async (extraPrompt?: string, cropRect?: SelectionRect) => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;
    if (vw === 0 || vh === 0) return;

    setIsAnalyzing(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (cropRect) {
        const videoEl = videoRef.current;
        const dispW = videoEl.clientWidth;
        const dispH = videoEl.clientHeight;
        const scaleX = vw / dispW;
        const scaleY = vh / dispH;
        const sx = Math.min(cropRect.startX, cropRect.endX) * scaleX;
        const sy = Math.min(cropRect.startY, cropRect.endY) * scaleY;
        const sw = Math.abs(cropRect.endX - cropRect.startX) * scaleX;
        const sh = Math.abs(cropRect.endY - cropRect.startY) * scaleY;
        
        if (sw < 10 || sh < 10) {
          setIsAnalyzing(false);
          return;
        }
        
        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, sw, sh);
      } else {
        canvas.width = vw;
        canvas.height = vh;
        ctx.drawImage(videoRef.current, 0, 0);
      }

      const hasBlue = !cropRect && detectBlueHighlight(canvas);
      setBlueDetected(hasBlue);

      const imageData = canvas.toDataURL('image/jpeg', 0.7);

      let query = extraPrompt || "What do you see? Answer in 1-2 short sentences.";
      if (cropRect) {
        query = "Read and analyze the selected content in this image. Give a clear, direct answer in 1-3 sentences. If it's text, read it out. If it's a question, answer it.";
      } else if (hasBlue) {
        query = "Focus on the content highlighted or marked in BLUE. Read and analyze that specific content. Give the answer directly in 1-2 short sentences.";
      }

      const response = await apiRequest("POST", "/api/analyze-image", {
        imageData,
        query,
        simple: true
      });
      const result = await response.json();
      const analysis = result.description || result.analysis || '';
      
      if (analysis) {
        setLastAnalysis(analysis);
        onAnalyze(imageData);
        if (autoVoice && (hasBlue || extraPrompt || cropRect)) {
          speakText(analysis);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, detectBlueHighlight, autoVoice, speakText, onAnalyze]);

  const startContinuousAnalysis = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (isActive && !isAnalyzing && videoReady) {
        analyzeFrame();
      }
    }, 2500);
  };

  const stopContinuousAnalysis = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!videoReady || videoRef.current.videoWidth === 0) {
      toast({ title: "Video not ready", description: "Please wait for the video to load." });
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
    analyzeFrame("Describe what you see clearly in 1-2 simple sentences.");
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleSelectionStart = (x: number, y: number) => {
    if (!selectMode) return;
    setIsSelecting(true);
    setSelection({ startX: x, startY: y, endX: x, endY: y });
  };

  const handleSelectionMove = (x: number, y: number) => {
    if (!isSelecting || !selection) return;
    setSelection(prev => prev ? { ...prev, endX: x, endY: y } : null);
    drawSelectionOverlay(x, y);
  };

  const handleSelectionEnd = () => {
    if (!isSelecting || !selection) return;
    setIsSelecting(false);
    const w = Math.abs(selection.endX - selection.startX);
    const h = Math.abs(selection.endY - selection.startY);
    if (w > 20 && h > 20) {
      analyzeFrame(undefined, selection);
    }
    setTimeout(() => {
      setSelection(null);
      clearOverlay();
    }, 500);
  };

  const drawSelectionOverlay = (curX: number, curY: number) => {
    if (!overlayRef.current || !selection) return;
    const ctx = overlayRef.current.getContext('2d');
    if (!ctx) return;
    const w = overlayRef.current.width;
    const h = overlayRef.current.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);
    
    const sx = Math.min(selection.startX, curX);
    const sy = Math.min(selection.startY, curY);
    const sw = Math.abs(curX - selection.startX);
    const sh = Math.abs(curY - selection.startY);
    
    ctx.clearRect(sx, sy, sw, sh);
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(sx, sy, sw, sh);
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(sx, sy, sw, sh);
  };

  const clearOverlay = () => {
    if (!overlayRef.current) return;
    const ctx = overlayRef.current.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
  };

  const syncOverlaySize = () => {
    if (overlayRef.current && containerRef.current) {
      overlayRef.current.width = containerRef.current.clientWidth;
      overlayRef.current.height = containerRef.current.clientHeight;
    }
  };

  useEffect(() => {
    if (selectMode) syncOverlaySize();
  }, [selectMode, videoReady]);

  if (error && !isActive) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-900/20 rounded-xl border border-red-800">
        <Camera className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-red-400 text-center text-sm mb-3">{error}</p>
        <div className="flex gap-2">
          <Button onClick={startCamera} size="sm" className="bg-green-600 hover:bg-green-700">
            <Camera className="w-4 h-4 mr-1" /> Camera
          </Button>
          <Button onClick={startScreenShare} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Monitor className="w-4 h-4 mr-1" /> Screen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {!isActive ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI Vision</h3>
          </div>
          <p className="text-zinc-400 text-sm text-center max-w-sm">
            Use your camera or share your screen. Select areas or mark blue for instant AI answers read aloud.
          </p>
          <div className="flex gap-3">
            <Button onClick={startCamera} size="lg" className="bg-green-600 hover:bg-green-700 px-6">
              <Camera className="w-5 h-5 mr-2" /> Camera
            </Button>
            <Button onClick={startScreenShare} size="lg" className="bg-blue-600 hover:bg-blue-700 px-6">
              <MonitorPlay className="w-5 h-5 mr-2" /> Share Screen
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border-2 border-zinc-700 bg-black" style={{ minHeight: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={handleVideoReady}
              onPlaying={handleVideoReady}
              className="w-full h-full object-contain"
              style={{ minHeight: '400px', maxHeight: '70vh' }}
            />

            {selectMode && (
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full z-10"
                style={{ cursor: 'crosshair' }}
                onMouseDown={(e) => { const p = getMousePos(e); handleSelectionStart(p.x, p.y); }}
                onMouseMove={(e) => { const p = getMousePos(e); handleSelectionMove(p.x, p.y); }}
                onMouseUp={handleSelectionEnd}
                onTouchStart={(e) => { e.preventDefault(); const p = getTouchPos(e); handleSelectionStart(p.x, p.y); }}
                onTouchMove={(e) => { e.preventDefault(); const p = getTouchPos(e); handleSelectionMove(p.x, p.y); }}
                onTouchEnd={(e) => { e.preventDefault(); handleSelectionEnd(); }}
              />
            )}

            {sourceMode === 'screen' && (
              <div className="absolute top-3 left-3 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 z-20 pointer-events-none">
                <Monitor className="w-3 h-3" /> Screen Share
              </div>
            )}

            {selectMode && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-bold z-20 pointer-events-none">
                DRAW TO SELECT
              </div>
            )}

            {blueDetected && (
              <div className="absolute top-3 right-3 bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-bold z-20 pointer-events-none">
                BLUE DETECTED
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 z-20 pointer-events-none">
                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
              </div>
            )}

            {continuousMode && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold z-20 pointer-events-none">
                LIVE
              </div>
            )}
          </div>

          {lastAnalysis && (
            <div className="bg-zinc-800/80 rounded-xl p-3 border border-zinc-700">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-zinc-200 leading-relaxed flex-1">{lastAnalysis}</p>
                <button
                  onClick={() => speakText(lastAnalysis)}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={captureAndAnalyze} disabled={isAnalyzing || !videoReady} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Eye className="w-4 h-4 mr-1" /> Analyze Now
            </Button>

            <Button onClick={() => { setSelectMode(!selectMode); if (selectMode) { setSelection(null); clearOverlay(); } }} size="sm"
              className={selectMode ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400" : "bg-zinc-700 hover:bg-zinc-600"}>
              <Crosshair className="w-4 h-4 mr-1" /> {selectMode ? "Selecting" : "Select"}
            </Button>

            <Button onClick={() => onContinuousMode(!continuousMode)} size="sm"
              className={continuousMode ? "bg-red-600 hover:bg-red-700" : "bg-zinc-700 hover:bg-zinc-600"}>
              {continuousMode ? "Stop Live" : "Go Live"}
            </Button>

            {sourceMode === 'camera' ? (
              <Button onClick={startScreenShare} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <MonitorPlay className="w-4 h-4 mr-1" /> Screen
              </Button>
            ) : (
              <Button onClick={startCamera} size="sm" className="bg-green-600 hover:bg-green-700">
                <Camera className="w-4 h-4 mr-1" /> Camera
              </Button>
            )}

            <Button onClick={() => setAutoVoice(!autoVoice)} size="sm"
              className={autoVoice ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-700 hover:bg-zinc-600"}>
              {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {isSpeaking && (
              <Button onClick={stopSpeaking} size="sm" variant="destructive">
                <VolumeX className="w-4 h-4 mr-1" /> Stop
              </Button>
            )}

            <Button onClick={stopStream} size="sm" variant="destructive">
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            {selectMode
              ? "Draw a rectangle around the text or area you want analyzed and read aloud"
              : sourceMode === 'screen' 
                ? "Use Select tool to pick content, or mark text in blue for instant AI analysis"
                : "Point camera at anything. Use Select or mark blue for auto-analysis"
            }
          </p>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
