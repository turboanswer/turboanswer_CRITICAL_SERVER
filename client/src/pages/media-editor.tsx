import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Upload, Download, Scissors, Play, Pause, Square,
  Plus, Trash2, Type, Sliders, Sparkles, Crown, Lock, X,
  RefreshCw, Film, ImageIcon, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  name: string;
  url: string;
  file: File;
  duration?: number;
  thumbnail?: string;
}

interface TextItem {
  id: string;
  text: string;
  position: 'top' | 'center' | 'bottom';
  size: number;
  color: string;
  bold: boolean;
  shadow: boolean;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
}

const DEFAULT_FILTERS: Filters = { brightness: 1, contrast: 1, saturation: 1, hue: 0, blur: 0, sepia: 0 };

const FILTER_PRESETS: { name: string; values: Filters }[] = [
  { name: 'Normal', values: { brightness: 1, contrast: 1, saturation: 1, hue: 0, blur: 0, sepia: 0 } },
  { name: 'Vivid', values: { brightness: 1.1, contrast: 1.3, saturation: 1.8, hue: 0, blur: 0, sepia: 0 } },
  { name: 'Cinematic', values: { brightness: 0.9, contrast: 1.4, saturation: 0.75, hue: 5, blur: 0, sepia: 0.1 } },
  { name: 'Vintage', values: { brightness: 1.05, contrast: 0.9, saturation: 0.7, hue: 15, blur: 0, sepia: 0.45 } },
  { name: 'B&W', values: { brightness: 1, contrast: 1.2, saturation: 0, hue: 0, blur: 0, sepia: 0 } },
  { name: 'Cool', values: { brightness: 1, contrast: 1.05, saturation: 1.2, hue: -25, blur: 0, sepia: 0 } },
  { name: 'Warm', values: { brightness: 1.05, contrast: 1.1, saturation: 1.2, hue: 22, blur: 0, sepia: 0.1 } },
  { name: 'Fade', values: { brightness: 1.1, contrast: 0.8, saturation: 0.7, hue: 0, blur: 0, sepia: 0.2 } },
  { name: 'Drama', values: { brightness: 0.85, contrast: 1.65, saturation: 0.65, hue: 0, blur: 0, sepia: 0 } },
  { name: 'Neon', values: { brightness: 1.1, contrast: 1.3, saturation: 2.5, hue: 0, blur: 0, sepia: 0 } },
];

const TEXT_COLORS = ['#ffffff', '#000000', '#ffcc00', '#ff4444', '#44aaff', '#44ff88', '#ff44cc', '#ff8844'];

function buildFilterStr(f: Filters): string {
  return `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturation}) hue-rotate(${f.hue}deg) blur(${f.blur}px) sepia(${f.sepia})`;
}

function EnterpriseLock() {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-pink-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Enterprise Exclusive</h2>
        <p className="text-gray-400 mb-6">Turbo Media Studio is available exclusively on the Enterprise plan ($70/month).</p>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-2">
          {["CapCut-style photo & video editing","Real-time filter previews (10 presets + manual)","Text overlays with custom styles","Timeline-based clip management","Gemini AI: auto-captions & style suggestions","Export as high-quality PNG or WebM video"].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-4 h-4 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="h-2.5 w-2.5 text-pink-400" />
              </div>
              {f}
            </div>
          ))}
        </div>
        <Link href="/pricing">
          <Button className="w-full h-12 font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500">
            Upgrade to Enterprise — $70/mo
          </Button>
        </Link>
        <Link href="/chat">
          <Button variant="ghost" className="w-full mt-2 text-gray-500 hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function MediaEditor() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [activePreset, setActivePreset] = useState('Normal');
  const [activeTab, setActiveTab] = useState<'filters' | 'text' | 'ai'>('filters');
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  const [newText, setNewText] = useState('');
  const [textPos, setTextPos] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [textSize, setTextSize] = useState(36);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBold, setTextBold] = useState(false);
  const [textShadow, setTextShadow] = useState(true);

  const [aiResult, setAiResult] = useState<{ captions: string[]; styles: string[]; description: string; mood: string; filters: Filters } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEnterprise = user?.subscriptionTier === 'enterprise';

  const currentItem = mediaItems.find(m => m.id === currentId) || null;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const filterStr = buildFilterStr(filters);

    if (currentItem?.type === 'image' && imgElRef.current?.complete) {
      ctx.filter = filterStr;
      ctx.drawImage(imgElRef.current, 0, 0, canvas.width, canvas.height);
    } else if (currentItem?.type === 'video' && videoElRef.current) {
      ctx.filter = filterStr;
      ctx.drawImage(videoElRef.current, 0, 0, canvas.width, canvas.height);
    }

    ctx.filter = 'none';
    texts.forEach(t => {
      const x = canvas.width / 2;
      const y = t.position === 'top' ? 60 + t.size : t.position === 'center' ? canvas.height / 2 : canvas.height - 50;
      ctx.font = `${t.bold ? 'bold ' : ''}${t.size}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      if (t.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, x, y);
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    });
  }, [currentItem, filters, texts]);

  const videoLoop = useCallback(() => {
    drawCanvas();
    rafRef.current = requestAnimationFrame(videoLoop);
  }, [drawCanvas]);

  useEffect(() => {
    if (currentItem?.type === 'video') {
      rafRef.current = requestAnimationFrame(videoLoop);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      cancelAnimationFrame(rafRef.current);
      drawCanvas();
    }
  }, [currentItem, drawCanvas, videoLoop]);

  useEffect(() => { drawCanvas(); }, [filters, texts, drawCanvas]);

  const loadMedia = useCallback((item: MediaItem) => {
    cancelAnimationFrame(rafRef.current);
    if (videoElRef.current) { videoElRef.current.pause(); videoElRef.current.src = ''; }

    setCurrentId(item.id);
    setIsPlaying(false);
    setTrimStart(0); setTrimEnd(100);

    if (item.type === 'image') {
      const img = new Image();
      img.onload = () => { imgElRef.current = img; drawCanvas(); };
      img.src = item.url;
    } else {
      const vid = document.createElement('video');
      vid.src = item.url;
      vid.muted = false;
      vid.crossOrigin = 'anonymous';
      vid.onloadedmetadata = () => {
        videoElRef.current = vid;
        rafRef.current = requestAnimationFrame(videoLoop);
      };
    }
  }, [drawCanvas, videoLoop]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const newItem: MediaItem = { id, type, name: file.name, url, file };

      if (type === 'image') {
        const img = new Image();
        img.onload = () => {
          const thumb = document.createElement('canvas');
          thumb.width = 80; thumb.height = 60;
          thumb.getContext('2d')?.drawImage(img, 0, 0, 80, 60);
          setMediaItems(prev => {
            const updated = [...prev, { ...newItem, thumbnail: thumb.toDataURL() }];
            return updated;
          });
        };
        img.src = url;
      } else {
        const vid = document.createElement('video');
        vid.src = url;
        vid.onloadedmetadata = () => {
          vid.currentTime = 0.1;
          vid.onseeked = () => {
            const thumb = document.createElement('canvas');
            thumb.width = 80; thumb.height = 60;
            thumb.getContext('2d')?.drawImage(vid, 0, 0, 80, 60);
            setMediaItems(prev => {
              const updated = [...prev, { ...newItem, thumbnail: thumb.toDataURL(), duration: vid.duration }];
              return updated;
            });
          };
        };
      }
    });
  }, []);

  useEffect(() => {
    const lastItem = mediaItems[mediaItems.length - 1];
    if (lastItem && (!currentId || currentId !== lastItem.id)) {
      loadMedia(lastItem);
    }
  }, [mediaItems, currentId, loadMedia]);

  const togglePlay = () => {
    const vid = videoElRef.current;
    if (!vid || currentItem?.type !== 'video') return;
    if (isPlaying) { vid.pause(); setIsPlaying(false); }
    else {
      const duration = vid.duration || 0;
      vid.currentTime = (trimStart / 100) * duration;
      vid.play();
      setIsPlaying(true);
      const checkEnd = setInterval(() => {
        if (!vid || vid.currentTime >= (trimEnd / 100) * (vid.duration || 0)) {
          vid.pause(); setIsPlaying(false); clearInterval(checkEnd);
        }
      }, 100);
    }
  };

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    setActivePreset(preset.name);
    setFilters(preset.values);
  };

  const exportMedia = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    if (currentItem?.type === 'image' || !currentItem) {
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `turbo-edit-${Date.now()}.png`;
      a.click();
      setIsExporting(false);
    } else {
      try {
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `turbo-edit-${Date.now()}.webm`;
          a.click(); URL.revokeObjectURL(url);
          setIsExporting(false);
        };
        recorder.start();
        const vid = videoElRef.current;
        if (vid) {
          const duration = vid.duration || 5;
          const startT = (trimStart / 100) * duration;
          const endT = (trimEnd / 100) * duration;
          vid.currentTime = startT; vid.play();
          setTimeout(() => { vid.pause(); recorder.stop(); }, (endT - startT) * 1000 + 200);
        } else { recorder.stop(); }
      } catch {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a'); a.href = dataUrl; a.download = `turbo-edit-${Date.now()}.png`; a.click();
        setIsExporting(false);
      }
    }
  }, [currentItem, trimStart, trimEnd]);

  const aiMutation = useMutation({
    mutationFn: async () => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('No canvas');
      const b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      const res = await fetch('/api/media/ai-suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ imageData: b64, mimeType: 'image/jpeg' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI failed');
      return data;
    },
    onSuccess: (data) => setAiResult(data),
    onError: (e: any) => toast({ title: 'AI Error', description: e.message, variant: 'destructive' }),
  });

  if (!isEnterprise) return <EnterpriseLock />;

  const TOOL_TABS = [
    { id: 'filters', label: 'Filters', icon: <Sliders className="h-4 w-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="h-4 w-4" /> },
    { id: 'ai', label: 'AI', icon: <Sparkles className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="h-screen bg-[#0a0a10] text-white flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EC4899, #F97316)' }}>
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-white text-sm">Turbo Studio</span>
            <span className="text-xs text-gray-600 hidden sm:block">CapCut-style editor powered by Gemini</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Crown className="h-3 w-3" /> Enterprise
          </div>
          <Button onClick={exportMedia} disabled={!currentItem || isExporting}
            className="h-8 px-4 text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500">
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Download className="h-3.5 w-3.5 mr-1.5" />Export</>}
          </Button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Media Panel */}
        <div className="w-24 sm:w-32 border-r border-white/[0.06] flex flex-col shrink-0">
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          <button onClick={() => fileInputRef.current?.click()}
            className="m-2 p-2 rounded-xl border-2 border-dashed border-white/10 text-gray-500 hover:border-pink-500/40 hover:text-pink-400 transition-colors flex flex-col items-center gap-1">
            <Plus className="h-5 w-5" />
            <span className="text-[10px]">Add</span>
          </button>
          <div className="flex-1 overflow-y-auto space-y-1.5 px-2 pb-2">
            {mediaItems.map(item => (
              <div key={item.id} onClick={() => loadMedia(item)}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${currentId === item.id ? 'ring-2 ring-pink-500' : 'opacity-60 hover:opacity-100'}`}>
                {item.thumbnail
                  ? <img src={item.thumbnail} alt={item.name} className="w-full h-14 object-cover" />
                  : <div className="w-full h-14 bg-white/5 flex items-center justify-center">
                    {item.type === 'video' ? <Film className="h-4 w-4 text-gray-500" /> : <ImageIcon className="h-4 w-4 text-gray-500" />}
                  </div>}
                {item.type === 'video' && <div className="absolute bottom-1 left-1"><Film className="h-3 w-3 text-white drop-shadow" /></div>}
                <button onClick={e => { e.stopPropagation(); setMediaItems(p => p.filter(m => m.id !== item.id)); if (currentId === item.id) setCurrentId(null); }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
            ))}
            {mediaItems.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center px-2">
                <Upload className="h-6 w-6 text-gray-600 mb-1" />
                <span className="text-[10px] text-gray-600">Upload photos or videos</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#050508] overflow-hidden p-4">
          <div className="relative w-full max-w-2xl" style={{ aspectRatio: '16/9' }}>
            <canvas ref={canvasRef} width={1280} height={720}
              className="w-full h-full rounded-xl shadow-2xl"
              style={{ background: '#111' }} />
            {!currentItem && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                <Scissors className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Upload media to start editing</p>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline"
                  className="mt-3 border-white/10 text-gray-400 hover:bg-white/5 text-xs">
                  <Upload className="h-4 w-4 mr-1.5" /> Add Media
                </Button>
              </div>
            )}
          </div>

          {/* Video controls */}
          {currentItem?.type === 'video' && (
            <div className="flex items-center gap-3 mt-3 w-full max-w-2xl">
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-pink-600/80 hover:bg-pink-600 flex items-center justify-center flex-shrink-0">
                {isPlaying ? <Pause className="h-4 w-4 fill-white text-white" /> : <Play className="h-4 w-4 fill-white text-white ml-0.5" />}
              </button>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Trim</span>
                  <input type="range" min={0} max={trimEnd - 1} value={trimStart}
                    onChange={e => setTrimStart(Number(e.target.value))}
                    className="flex-1 h-1 accent-pink-500" />
                  <input type="range" min={trimStart + 1} max={100} value={trimEnd}
                    onChange={e => setTrimEnd(Number(e.target.value))}
                    className="flex-1 h-1 accent-pink-500" />
                  <span>{trimStart}%–{trimEnd}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tools Panel */}
        <div className="w-64 sm:w-72 border-l border-white/[0.06] flex flex-col shrink-0 overflow-hidden">
          {/* Tool tabs */}
          <div className="flex border-b border-white/[0.06] shrink-0">
            {TOOL_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-pink-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">

            {/* ── FILTERS TAB ── */}
            {activeTab === 'filters' && (
              <>
                {/* Preset chips */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Presets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_PRESETS.map(p => (
                      <button key={p.name} onClick={() => applyPreset(p)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                          activePreset === p.name
                            ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                            : 'bg-white/[0.04] border-white/10 text-gray-500 hover:text-gray-200'
                        }`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual sliders */}
                {([
                  { key: 'brightness', label: 'Brightness', min: 0.3, max: 2, step: 0.05 },
                  { key: 'contrast', label: 'Contrast', min: 0.3, max: 2.5, step: 0.05 },
                  { key: 'saturation', label: 'Saturation', min: 0, max: 3, step: 0.05 },
                  { key: 'hue', label: 'Hue Shift', min: -180, max: 180, step: 1 },
                  { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1 },
                  { key: 'sepia', label: 'Sepia', min: 0, max: 1, step: 0.02 },
                ] as const).map(({ key, label, min, max, step }) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-500">{filters[key].toFixed(key === 'hue' ? 0 : 2)}</span>
                    </div>
                    <input type="range" min={min} max={max} step={step} value={filters[key]}
                      onChange={e => { setActivePreset('Custom'); setFilters(prev => ({ ...prev, [key]: Number(e.target.value) })); }}
                      className="w-full h-1.5 accent-pink-500 rounded-full" />
                  </div>
                ))}

                <Button onClick={() => { setFilters(DEFAULT_FILTERS); setActivePreset('Normal'); }}
                  variant="ghost" size="sm" className="w-full text-xs text-gray-500 hover:text-gray-300">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
                </Button>
              </>
            )}

            {/* ── TEXT TAB ── */}
            {activeTab === 'text' && (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1.5">Text content</p>
                    <input value={newText} onChange={e => setNewText(e.target.value)}
                      placeholder="Your text here..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1.5">Position</p>
                    <div className="flex gap-1.5">
                      {(['top', 'center', 'bottom'] as const).map(pos => (
                        <button key={pos} onClick={() => setTextPos(pos)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                            textPos === pos ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-gray-300'
                          }`}>
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Size</span>
                      <span className="text-gray-500">{textSize}px</span>
                    </div>
                    <input type="range" min={16} max={96} value={textSize} onChange={e => setTextSize(Number(e.target.value))}
                      className="w-full h-1.5 accent-pink-500" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1.5">Color</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {TEXT_COLORS.map(c => (
                        <button key={c} onClick={() => setTextColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${textColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setTextBold(!textBold)}
                      className={`flex-1 py-2 rounded-lg text-xs font-black border transition-colors ${textBold ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/[0.03] border-white/10 text-gray-500'}`}>
                      Bold
                    </button>
                    <button onClick={() => setTextShadow(!textShadow)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${textShadow ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/[0.03] border-white/10 text-gray-500'}`}>
                      Shadow
                    </button>
                  </div>

                  <Button onClick={() => {
                    if (!newText.trim()) return;
                    setTexts(prev => [...prev, { id: Date.now().toString(), text: newText.trim(), position: textPos, size: textSize, color: textColor, bold: textBold, shadow: textShadow }]);
                    setNewText('');
                  }} disabled={!newText.trim()}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-xs font-bold">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Text
                  </Button>
                </div>

                {texts.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400">Added texts</p>
                    {texts.map(t => (
                      <div key={t.id} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2">
                        <span className="flex-1 text-xs text-gray-300 truncate" style={{ color: t.color, fontWeight: t.bold ? 700 : 400 }}>{t.text}</span>
                        <span className="text-[10px] text-gray-600">{t.position}</span>
                        <button onClick={() => setTexts(prev => prev.filter(x => x.id !== t.id))} className="text-gray-600 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── AI TAB ── */}
            {activeTab === 'ai' && (
              <>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <p className="text-xs text-gray-500 leading-relaxed">Gemini AI analyzes your current frame and suggests captions, filter styles, and scene descriptions.</p>
                </div>

                <Button onClick={() => aiMutation.mutate()} disabled={!currentItem || aiMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 font-bold text-xs">
                  {aiMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Analyzing...</> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Analyze with Gemini</>}
                </Button>

                {aiResult && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1.5">Scene</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{aiResult.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Mood: {aiResult.mood}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1.5">Suggested captions</p>
                      {aiResult.captions?.map((cap, i) => (
                        <button key={i} onClick={() => { setNewText(cap); setActiveTab('text'); }}
                          className="block w-full text-left text-xs text-gray-300 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 mb-1.5 hover:border-pink-500/40 hover:text-white transition-colors">
                          "{cap}"
                        </button>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1.5">Suggested styles</p>
                      {aiResult.styles?.map((style, i) => (
                        <p key={i} className="text-xs text-gray-400 mb-1">• {style}</p>
                      ))}
                    </div>

                    {aiResult.filters && (
                      <Button onClick={() => { setFilters(aiResult.filters); setActivePreset('AI Suggested'); }}
                        size="sm" variant="outline" className="w-full text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Apply AI Filters
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="h-20 border-t border-white/[0.06] bg-[#050508] shrink-0 flex items-center gap-2 px-4 overflow-x-auto">
        {mediaItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-700 text-xs">
            Timeline — add photos and videos above to start editing
          </div>
        ) : (
          <>
            <button onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 hover:border-pink-500/40 hover:text-pink-500 transition-colors shrink-0">
              <Plus className="h-5 w-5" />
            </button>
            {mediaItems.map((item, idx) => (
              <div key={item.id} onClick={() => loadMedia(item)}
                className={`relative rounded-lg overflow-hidden cursor-pointer shrink-0 transition-all ${currentId === item.id ? 'ring-2 ring-pink-500 scale-105' : 'opacity-50 hover:opacity-80'}`}
                style={{ width: 96, height: 56 }}>
                {item.thumbnail
                  ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    {item.type === 'video' ? <Film className="h-4 w-4 text-gray-500" /> : <ImageIcon className="h-4 w-4 text-gray-500" />}
                  </div>}
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 text-[9px] text-white bg-black/50 truncate">
                  {idx + 1}. {item.name.split('.')[0]}
                </div>
                {item.type === 'video' && <Film className="absolute top-1 right-1 h-3 w-3 text-white drop-shadow" />}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
