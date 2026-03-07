import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Music, Play, Pause, Square, Download, Loader2,
  Lock, Crown, Sparkles, RefreshCw, Volume2, VolumeX
} from "lucide-react";

const GENRES = ["Pop","R&B","Hip-Hop","EDM","Rock","Country","Jazz","Classical","Lo-Fi","Soul"];
const MOODS = ["Upbeat","Melancholic","Energetic","Romantic","Dark","Peaceful","Epic","Dreamy","Intense","Playful"];

const SECTION_COLORS: Record<string, string> = {
  intro: '#4285F4', verse: '#34A853', 'pre-chorus': '#FBBC05',
  chorus: '#EA4335', bridge: '#9C27B0', outro: '#4285F4',
};

const noteToHz: Record<string, number> = {
  'C2':65.41,'D2':73.42,'E2':82.41,'F2':87.31,'G2':98.00,'A2':110.00,'B2':123.47,
  'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196.00,'A3':220.00,'B3':246.94,
  'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392.00,'A4':440.00,'B4':493.88,
  'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99,'A5':880.00,'B5':987.77,
  'Eb3':155.56,'F#3':185.00,'G#3':207.65,'Bb3':233.08,'C#4':277.18,'Eb4':311.13,
  'F#4':369.99,'G#4':415.30,'Bb4':466.16,'Eb5':622.25,'F#5':739.99,
  'Ab3':207.65,'Bb2':116.54,
};

const chordNotes: Record<string, string[]> = {
  'C':['C3','E3','G3','C4'],'Cm':['C3','Eb3','G3','C4'],
  'D':['D3','F#3','A3','D4'],'Dm':['D3','F3','A3','D4'],
  'E':['E3','G#3','B3'],'Em':['E3','G3','B3','E4'],
  'F':['F3','A3','C4','F4'],'Fm':['F3','Ab3','C4'],
  'G':['G3','B3','D4','G4'],'Gm':['G3','Bb3','D4'],
  'A':['A3','C#4','E4'],'Am':['A3','C4','E4','A4'],
  'Bb':['Bb3','D4','F4'],'B':['B3','Eb4','F#4'],'Bm':['B3','D4','F#4'],
  'G7':['G3','B3','D4','F4'],'Am7':['A3','C4','E4','G4'],
  'Dm7':['D3','F3','A3','C4'],'Cmaj7':['C3','E3','G3','B3'],
  'Fmaj7':['F3','A3','C4','E4'],'E7':['E3','G#3','B3','D4'],
  'A7':['A3','C#4','E4','G4'],'D7':['D3','F#3','A3','C4'],
  'C/G':['G2','C3','E3','G3'],'G/B':['B2','G3','B3','D4'],
};

interface SongData {
  title: string; artist: string; bpm: number; key: string;
  timeSignature: string; genre: string; mood: string; description: string;
  chordProgression: string[];
  sections: { type: string; chords: string[]; lyrics?: string; bars?: number }[];
  melody: { note: string; duration: number }[];
}

function EnterpriseLock() {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Enterprise Exclusive</h2>
        <p className="text-gray-400 mb-6">Lyria Music Studio is available exclusively on the Enterprise plan ($70/month).</p>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-2">
          {["AI-generated original songs with lyrics","Web Audio synthesizer playback","Full song structure (verse/chorus/bridge)","BPM-synced chord progressions","Download complete song as text"].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="h-2.5 w-2.5 text-violet-400" />
              </div>
              {f}
            </div>
          ))}
        </div>
        <Link href="/pricing">
          <Button className="w-full h-12 font-bold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500">
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

function WaveVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = Array.from({ length: 32 });
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all ${isPlaying ? 'animate-pulse' : ''}`}
          style={{
            background: `hsl(${(i * 11) % 360}, 80%, 65%)`,
            height: isPlaying ? `${20 + Math.sin(i * 0.8) * 18 + Math.random() * 8}px` : '4px',
            animationDelay: `${i * 0.05}s`,
            transition: 'height 0.15s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function MusicStudio() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [mood, setMood] = useState("Upbeat");
  const [song, setSong] = useState<SongData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(-1);
  const [muted, setMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stopFnRef = useRef<(() => void) | null>(null);
  const isEnterprise = user?.subscriptionTier === 'enterprise';

  useEffect(() => () => { stopFnRef.current?.(); }, []);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idea, genre, mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      return data as SongData;
    },
    onSuccess: (data) => { setSong(data); setCurrentSection(-1); },
    onError: (e: any) => toast({ title: 'Generation failed', description: e.message, variant: 'destructive' }),
  });

  const getOrCreateCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return { ctx: audioCtxRef.current, master: masterGainRef.current! };
  }, []);

  const playNote = useCallback((ctx: AudioContext, master: GainNode, freq: number, start: number, dur: number, gain = 0.12, wave: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + 0.02);
    env.gain.linearRampToValueAtTime(gain * 0.7, start + dur * 0.5);
    env.gain.linearRampToValueAtTime(0, start + dur - 0.05);
    osc.connect(env);
    env.connect(master);
    osc.start(start);
    osc.stop(start + dur);
    return osc;
  }, []);

  const playChord = useCallback((ctx: AudioContext, master: GainNode, chordName: string, start: number, dur: number) => {
    const notes = chordNotes[chordName] || chordNotes[chordName.replace(/[^A-Za-z]/g, '')] || ['C3','E3','G3'];
    notes.forEach((note, i) => {
      const freq = noteToHz[note];
      if (freq) playNote(ctx, master, freq, start + i * 0.015, dur, 0.06, 'triangle');
    });
  }, [playNote]);

  const playSong = useCallback(() => {
    if (!song) return;
    const { ctx, master } = getOrCreateCtx();
    master.gain.value = muted ? 0 : 0.8;

    const bps = song.bpm / 60;
    const beatDur = 1 / bps;
    const measureDur = 4 * beatDur;

    let t = ctx.currentTime + 0.1;
    const sectionTimings: number[] = [];

    song.sections.forEach((section) => {
      sectionTimings.push(t);
      const chords = section.chords || song.chordProgression;
      const bars = section.bars || 4;
      const barsCount = section.lyrics ? Math.ceil(section.lyrics.split('\n').length) + 1 : bars;
      const chordsPerBar = Math.max(1, Math.round(chords.length / barsCount));

      for (let bar = 0; bar < barsCount; bar++) {
        const chord = chords[bar % chords.length];
        playChord(ctx, master, chord, t, measureDur - 0.05);
        t += measureDur;
      }
    });

    song.melody.forEach((m, i) => {
      const melodyStart = ctx.currentTime + 0.1 + i * beatDur * 0.5;
      const freq = noteToHz[m.note];
      if (freq) playNote(ctx, master, freq, melodyStart, m.duration * beatDur, 0.08, 'sine');
    });

    const timers: ReturnType<typeof setTimeout>[] = [];
    sectionTimings.forEach((st, idx) => {
      const delay = Math.max(0, (st - ctx.currentTime) * 1000);
      timers.push(setTimeout(() => setCurrentSection(idx), delay));
    });
    const totalDur = t - ctx.currentTime;
    const endTimer = setTimeout(() => { setIsPlaying(false); setCurrentSection(-1); }, totalDur * 1000);

    stopFnRef.current = () => {
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
      try { ctx.suspend(); } catch {}
      setIsPlaying(false);
      setCurrentSection(-1);
    };

    setIsPlaying(true);
  }, [song, muted, getOrCreateCtx, playChord, playNote]);

  const stopSong = useCallback(() => {
    stopFnRef.current?.();
    stopFnRef.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      if (masterGainRef.current) masterGainRef.current.gain.value = next ? 0 : 0.8;
      return next;
    });
  }, []);

  const downloadSong = useCallback(() => {
    if (!song) return;
    let txt = `${song.title}\nBy ${song.artist}\n${'─'.repeat(40)}\n`;
    txt += `Genre: ${song.genre} | Mood: ${song.mood}\nBPM: ${song.bpm} | Key: ${song.key} | Time: ${song.timeSignature}\n\n`;
    txt += `${song.description}\n\n`;
    txt += `Chord Progression: ${song.chordProgression.join(' - ')}\n\n`;
    song.sections.forEach(s => {
      txt += `[${s.type.toUpperCase()}]\n`;
      if (s.chords) txt += `Chords: ${s.chords.join(' - ')}\n`;
      if (s.lyrics) txt += `${s.lyrics}\n`;
      txt += '\n';
    });
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${song.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  }, [song]);

  if (!isEnterprise) return <EnterpriseLock />;

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-4">
        <Link href="/chat">
          <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
            <Music className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-none">Lyria Music Studio</h1>
            <p className="text-xs text-gray-500 mt-0.5">Powered by Google Lyria · Gemini AI</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-400">
          <Crown className="h-3 w-3" /> Enterprise
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">

        {/* Song Input */}
        {!song && (
          <div className="rounded-2xl border border-white/[0.08] p-6" style={{ background: 'linear-gradient(135deg, #0d0820 0%, #080810 100%)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
              <h2 className="text-base font-bold text-white">Create Your Song</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Song idea</label>
                <Textarea
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder="A heartfelt song about chasing your dreams no matter what people say..."
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 resize-none h-24 focus:border-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Genre</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map(g => (
                      <button key={g} onClick={() => setGenre(g)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          genre === g ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-gray-300'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Mood</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map(m => (
                      <button key={m} onClick={() => setMood(m)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          mood === m ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-gray-300'
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!idea.trim() || generateMutation.isPending}
                className="w-full h-12 font-bold text-base bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
              >
                {generateMutation.isPending
                  ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Composing your song with Lyria...</>
                  : <><Music className="h-5 w-5 mr-2" />Generate Song</>}
              </Button>
            </div>
          </div>
        )}

        {/* Song Result */}
        {song && (
          <>
            {/* Song Header */}
            <div className="rounded-2xl border border-white/[0.08] p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0830 0%, #0d0820 100%)' }}>
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: '#7C3AED' }} />
              <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-15 blur-3xl" style={{ background: '#EC4899' }} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">{song.title}</h2>
                    <p className="text-sm text-violet-400 mt-1">{song.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">{song.description}</p>
                  </div>
                  <Button onClick={() => { stopSong(); setSong(null); setIdea(''); }}
                    variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 hover:bg-white/5 shrink-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {[song.genre, song.mood, `${song.bpm} BPM`, song.key, song.timeSignature].map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-gray-400">{tag}</span>
                  ))}
                </div>

                {/* Waveform */}
                <WaveVisualizer isPlaying={isPlaying} />

                {/* Controls */}
                <div className="flex items-center gap-3 mt-4">
                  {!isPlaying ? (
                    <Button onClick={playSong} className="gap-2 bg-violet-600 hover:bg-violet-500 font-bold">
                      <Play className="h-5 w-5 fill-white" /> Play
                    </Button>
                  ) : (
                    <Button onClick={stopSong} className="gap-2 bg-pink-600 hover:bg-pink-500 font-bold">
                      <Square className="h-5 w-5 fill-white" /> Stop
                    </Button>
                  )}
                  <button onClick={toggleMute} className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <Button onClick={downloadSong} variant="outline" className="ml-auto gap-2 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Chord Progression */}
            <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-sm font-bold text-gray-300 mb-3">Chord Progression</h3>
              <div className="flex flex-wrap gap-2">
                {song.chordProgression.map((chord, i) => (
                  <div key={i} className="px-4 py-2 rounded-xl text-sm font-black border"
                    style={{ background: `${SECTION_COLORS[Object.keys(SECTION_COLORS)[i % 4]]}15`, borderColor: `${SECTION_COLORS[Object.keys(SECTION_COLORS)[i % 4]]}40`, color: SECTION_COLORS[Object.keys(SECTION_COLORS)[i % 4]] }}>
                    {chord}
                  </div>
                ))}
              </div>
            </div>

            {/* Lyrics / Sections */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-300">Song Structure & Lyrics</h3>
              {song.sections.map((section, i) => {
                const color = SECTION_COLORS[section.type] || '#888';
                const isActive = currentSection === i;
                return (
                  <div key={i} className={`rounded-2xl border p-4 transition-all ${isActive ? 'shadow-lg' : ''}`}
                    style={{
                      background: isActive ? `${color}10` : 'rgba(255,255,255,0.02)',
                      borderColor: isActive ? `${color}50` : 'rgba(255,255,255,0.06)',
                    }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                        {section.type}
                      </span>
                      <div className="flex gap-1.5">
                        {(section.chords || song.chordProgression).map((c, ci) => (
                          <span key={ci} className="text-xs px-2 py-0.5 rounded font-bold"
                            style={{ background: `${color}15`, color, opacity: 0.8 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                      {isActive && <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />}
                    </div>
                    {section.lyrics ? (
                      <div className="space-y-1">
                        {section.lyrics.split('\n').map((line, li) => (
                          <p key={li} className={`text-sm leading-relaxed transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">{section.bars || 4} bars instrumental</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Generate Another */}
            <div className="text-center pb-6">
              <Button onClick={() => { stopSong(); setSong(null); }}
                variant="outline" className="gap-2 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
                <Music className="h-4 w-4" /> Generate Another Song
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
