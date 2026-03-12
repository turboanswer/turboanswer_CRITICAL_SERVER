import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, X, Volume2, VolumeX } from "lucide-react";

type Status = "idle" | "listening" | "thinking" | "speaking";

interface Turn { id: number; role: "user" | "assistant"; text: string; }

// ─── Voice picker ─────────────────────────────────────────────────────────────
function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const all = synth.getVoices();
  const want = [
    "Google UK English Male",
    "Microsoft Ryan Online (Natural) - English (United States)",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Microsoft Mark - English (United States)",
    "Microsoft David - English (United States)",
    "Alex", "Daniel", "Aaron", "Rishi", "Google US English",
  ];
  for (const name of want) {
    const v = all.find(v => v.name === name || v.name.startsWith(name));
    if (v) return v;
  }
  return (
    all.find(v => v.lang.startsWith("en") && /male|guy|david|mark|ryan|daniel|alex|aaron/i.test(v.name)) ||
    all.find(v => v.lang === "en-US") ||
    all.find(v => v.lang.startsWith("en")) ||
    null
  );
}

// ─── Orb ─────────────────────────────────────────────────────────────────────
const CFG: Record<Status, { g: [string,string,string]; glow: string; r: string; scale: number; dur: string }> = {
  idle:      { g: ["#1e3a5f","#0d2137","#1a2e4a"],  glow: "#1e3a5f", r:"50%", scale:0.55, dur:"6s" },
  listening: { g: ["#1a9e4a","#1565C0","#00897b"],   glow:"#1a9e4a", r:"48% 52% 42% 58% / 54% 46% 60% 40%", scale:1,    dur:"1.4s" },
  thinking:  { g: ["#F9A825","#FB8C00","#E65100"],   glow:"#F9A825", r:"50%", scale:0.88, dur:"0.9s" },
  speaking:  { g: ["#3d5afe","#7c4dff","#d500f9"],   glow:"#7c4dff", r:"44% 56% 50% 50% / 58% 42% 56% 44%", scale:1.12, dur:"0.7s" },
};

function GeminiOrb({ status, interim }: { status: Status; interim: string }) {
  const cfg = CFG[status];
  const active = status !== "idle";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Glow rings */}
      {active && [1,2,3].map(i => (
        <div key={i} className="absolute rounded-full" style={{
          width:  130 + i*24, height: 130 + i*24,
          border: `1px solid ${cfg.g[i % 3]}55`,
          opacity: 0.5 / i,
          animation: `lv-ring ${2+i}s linear infinite`,
          animationDirection: i % 2 ? "normal" : "reverse",
        }} />
      ))}

      {/* Blob */}
      <div style={{
        width: 130, height: 130,
        transform: `scale(${cfg.scale})`,
        borderRadius: cfg.r,
        background: `radial-gradient(circle at 38% 36%, ${cfg.g[0]}, ${cfg.g[1]} 55%, ${cfg.g[2]})`,
        boxShadow: active ? `0 0 50px ${cfg.glow}77, 0 0 100px ${cfg.glow}33` : `0 0 20px ${cfg.glow}33`,
        transition: "border-radius 0.7s ease, transform 0.5s ease, background 0.8s ease, box-shadow 0.8s ease",
        animation: active ? `lv-morph-${status} ${cfg.dur} ease-in-out infinite alternate` : undefined,
      }} />

      {/* Wave bars — speaking */}
      {status === "speaking" && (
        <div className="absolute flex items-end gap-[3px]" style={{ bottom: 18 }}>
          {[5,9,13,17,22,17,13,9,5].map((h,i) => (
            <div key={i} style={{
              width: 3, height: h, borderRadius: 2,
              background: cfg.g[i%3],
              animation: `lv-wave ${0.4+i%3*0.15}s ease-in-out ${i*0.06}s infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {/* Mic dots — listening */}
      {status === "listening" && (
        <div className="absolute flex items-center gap-2" style={{ bottom: 20 }}>
          {[0,1,2,3,2,1,0].map((delay, i) => (
            <div key={i} style={{
              width: 4, height: 4+(delay*2), borderRadius: 2,
              background: cfg.g[0],
              animation: `lv-mic ${0.6+delay*0.12}s ease-in-out ${delay*0.1}s infinite alternate`,
              opacity: 0.7 + delay * 0.1,
            }} />
          ))}
        </div>
      )}

      {/* Spinning dots — thinking */}
      {status === "thinking" && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="absolute w-2 h-2 rounded-full" style={{
              background: cfg.g[i],
              animation: `lv-orbit 1.2s ease-in-out ${i*0.4}s infinite`,
            }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes lv-ring   { to { transform: rotate(360deg); } }
        @keyframes lv-morph-listening {
          0%   { border-radius: 48% 52% 42% 58% / 54% 46% 60% 40%; }
          100% { border-radius: 60% 40% 56% 44% / 40% 60% 36% 64%; }
        }
        @keyframes lv-morph-speaking {
          0%   { border-radius: 44% 56% 50% 50% / 58% 42% 56% 44%; }
          100% { border-radius: 56% 44% 44% 56% / 42% 58% 44% 56%; }
        }
        @keyframes lv-morph-thinking {
          0%   { transform: scale(0.88) rotate(0deg); }
          100% { transform: scale(0.94) rotate(120deg); }
        }
        @keyframes lv-wave {
          from { transform: scaleY(0.5); opacity: 0.6; }
          to   { transform: scaleY(2.2); opacity: 1; }
        }
        @keyframes lv-mic {
          from { transform: scaleY(0.6); opacity: 0.5; }
          to   { transform: scaleY(2);   opacity: 1; }
        }
        @keyframes lv-orbit {
          0%   { transform: translateX(0px)  translateY(-28px) scale(0.7); }
          33%  { transform: translateX(24px) translateY(14px)  scale(1);   }
          66%  { transform: translateX(-24px) translateY(14px) scale(0.7); }
          100% { transform: translateX(0px)  translateY(-28px) scale(0.7); }
        }
      `}</style>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AILive() {
  const [status, setStatus]     = useState<Status>("idle");
  const [turns, setTurns]       = useState<Turn[]>([]);
  const [interim, setInterim]   = useState("");
  const [muted, setMuted]       = useState(false);
  const [error, setError]       = useState("");

  // Refs that survive re-renders
  const sid        = useRef(0);          // session id — increment to kill all old callbacks
  const statusRef  = useRef<Status>("idle");
  const histRef    = useRef<{role:string;content:string}[]>([]);
  const recRef     = useRef<any>(null);
  const synthRef   = useRef(window.speechSynthesis);
  const voiceRef   = useRef<SpeechSynthesisVoice|null>(null);
  const turnId     = useRef(0);
  const mutedRef   = useRef(false);

  mutedRef.current = muted;

  function go(s: Status) { statusRef.current = s; setStatus(s); }

  // Load voice (voiceschanged fires asynchronously in Chrome)
  useEffect(() => {
    const load = () => { voiceRef.current = pickVoice(synthRef.current); };
    load();
    synthRef.current.addEventListener("voiceschanged", load);
    return () => {
      sid.current += 1;
      synthRef.current.removeEventListener("voiceschanged", load);
      synthRef.current.cancel();
      killRec();
    };
  }, []);

  function killRec() {
    const r = recRef.current;
    recRef.current = null;
    try { r?.abort(); } catch {}
  }

  // ── Start one recognition pass ──────────────────────────────────────────────
  function startRec(mySid: number) {
    if (mySid !== sid.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice recognition not supported. Please use Chrome or Edge."); go("idle"); return; }

    killRec();

    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = "en-US";
    rec.maxAlternatives = 1;
    recRef.current      = rec;

    rec.onstart = () => {
      if (mySid !== sid.current) return;
      go("listening");
      setInterim("");
    };

    rec.onresult = (e: any) => {
      if (mySid !== sid.current) return;
      let inter = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else inter += t;
      }
      if (inter) setInterim(inter);
      if (final.trim()) {
        setInterim("");
        killRec();
        askAI(final.trim(), mySid);
      }
    };

    rec.onerror = (e: any) => {
      if (mySid !== sid.current) return;
      if (e.error === "aborted") return; // we caused it — ignore
      if (e.error === "no-speech") {
        // restart quietly
        if (statusRef.current === "listening") setTimeout(() => startRec(mySid), 120);
        return;
      }
      if (e.error === "not-allowed") {
        setError("Microphone blocked. Allow microphone access in your browser then tap Start.");
        go("idle"); sid.current += 1; return;
      }
      // any other error: try restarting
      setTimeout(() => startRec(mySid), 400);
    };

    rec.onend = () => {
      if (mySid !== sid.current) return;
      // Only restart if we're still supposed to be listening
      if (statusRef.current === "listening") {
        setTimeout(() => startRec(mySid), 120);
      }
    };

    try { rec.start(); }
    catch (ex: any) {
      if (mySid === sid.current) setTimeout(() => startRec(mySid), 300);
    }
  }

  // ── Ask AI ──────────────────────────────────────────────────────────────────
  async function askAI(text: string, mySid: number) {
    if (mySid !== sid.current) return;
    go("thinking");

    const userTurn: Turn = { id: turnId.current++, role: "user", text };
    setTurns(p => [...p, userTurn]);
    histRef.current = [...histRef.current, { role: "user", content: text }];

    try {
      const res  = await fetch("/api/ai-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, history: histRef.current.slice(-12) }),
      });
      if (mySid !== sid.current) return;

      const data  = await res.json();
      const reply = (data.reply ?? "I'm here — what would you like to talk about?")
        .replace(/[\*\_\#\`]+/g, "").trim();

      const aiTurn: Turn = { id: turnId.current++, role: "assistant", text: reply };
      setTurns(p => [...p, aiTurn]);
      histRef.current = [...histRef.current, { role: "assistant", content: reply }];

      if (mySid !== sid.current) return;
      go("speaking");
      speakReply(reply, mySid);

    } catch {
      if (mySid !== sid.current) return;
      setError("Connection issue — resuming…");
      go("listening");
      startRec(mySid);
    }
  }

  // ── Speak ──────────────────────────────────────────────────────────────────
  function speakReply(text: string, mySid: number) {
    const synth = synthRef.current;
    synth.cancel();

    const done = () => {
      if (mySid !== sid.current) return;
      go("listening");
      startRec(mySid);
    };

    if (mutedRef.current) { setTimeout(done, 0); return; }

    const u = new SpeechSynthesisUtterance(text);
    u.rate  = 0.97;
    u.pitch = 0.92;
    if (voiceRef.current) u.voice = voiceRef.current;
    u.onend   = done;
    u.onerror = done;
    setTimeout(() => { try { synth.speak(u); } catch { done(); } }, 60);
  }

  // ── Session control ────────────────────────────────────────────────────────
  function startSession() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice recognition requires Chrome or Edge."); return; }
    setError("");
    setTurns([]);
    histRef.current = [];
    const mySid = ++sid.current;
    go("listening");
    startRec(mySid);
  }

  function endSession() {
    // Increment FIRST — this kills every pending callback immediately
    sid.current += 1;
    go("idle");
    setInterim("");
    killRec();
    synthRef.current.cancel();
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const isActive  = status !== "idle";
  const lastAI    = [...turns].reverse().find(t => t.role === "assistant");
  const lastUser  = [...turns].reverse().find(t => t.role === "user");

  const statusLabel: Record<Status, string> = {
    idle:      "",
    listening: "Listening",
    thinking:  "Thinking",
    speaking:  "Speaking",
  };

  return (
    <div
      className="flex flex-col h-[100dvh] select-none overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 110%, #071428 0%, #050a14 45%, #020508 100%)" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 relative z-30">
        <Link href="/chat">
          <button className="flex items-center gap-1.5 text-white/35 hover:text-white/65 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Chat</span>
          </button>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/50">Turbo Live</span>
          {isActive && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse 1.4s ease-in-out infinite", boxShadow: "0 0 6px #34D399" }} />
              <span className="text-[10px] font-semibold tracking-widest text-emerald-400/70 uppercase">Live</span>
            </div>
          )}
        </div>

        <button onClick={() => setMuted(m => { if (!m) synthRef.current.cancel(); return !m; })}
          className="p-2 rounded-xl text-white/30 hover:text-white/60 transition-colors">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 pb-8 overflow-hidden">

        {/* Text display */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs gap-5 text-center">
          {!isActive ? (
            <div className="space-y-2">
              <p className="text-xl font-light text-white/60 tracking-tight">AI Live</p>
              <p className="text-sm text-white/25 leading-relaxed">
                Fully hands-free voice conversation.<br />Tap once to start — no tapping between turns.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4 min-h-[90px] flex flex-col items-center justify-center">
              {/* AI reply */}
              {lastAI && (status === "speaking" || (status === "listening" && !interim)) && (
                <p key={lastAI.id} className="text-white/80 text-[17px] font-light leading-relaxed"
                  style={{ animation: "lv-up 0.35s ease-out" }}>
                  {lastAI.text}
                </p>
              )}
              {/* User last said */}
              {lastUser && status === "thinking" && (
                <p key={lastUser.id} className="text-white/35 text-sm"
                  style={{ animation: "lv-up 0.25s ease-out" }}>
                  {lastUser.text}
                </p>
              )}
              {/* Live interim */}
              {interim && (
                <p className="text-white/50 text-base italic leading-snug">"{interim}"</p>
              )}
            </div>
          )}
        </div>

        {/* Status dot row */}
        {isActive && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 mb-5 font-medium">
            {statusLabel[status]}
          </p>
        )}

        {/* Orb */}
        <div className="mb-8">
          <GeminiOrb status={status} interim={interim} />
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-xs text-amber-400/70 text-center max-w-[260px] leading-relaxed">{error}</p>
        )}

        {/* Buttons */}
        {!isActive ? (
          <button onClick={startSession}
            className="w-full max-w-[220px] py-4 rounded-2xl text-white font-semibold text-[15px] transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #1565C0, #1a9e4a)", boxShadow: "0 4px 32px rgba(21,101,192,0.4)" }}>
            Start conversation
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button onClick={endSession}
              className="flex items-center justify-center w-14 h-14 rounded-full transition-all active:scale-90"
              style={{ background:"rgba(220,38,38,0.12)", border:"1.5px solid rgba(220,38,38,0.35)", boxShadow:"0 0 24px rgba(220,38,38,0.12)" }}>
              <X className="w-5 h-5 text-red-400" />
            </button>
            <p className="text-[10px] text-white/20">End session</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes lv-up {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
