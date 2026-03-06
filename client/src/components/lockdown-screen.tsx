import { useEffect, useRef } from 'react';
import { AlertOctagon } from 'lucide-react';

export default function LockdownScreen() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(ctx.destination);

    let phase = 0;
    const ALARM_HI = 1480;
    const ALARM_LO = 880;
    const CYCLE = 1.2;

    function buildTone(freq: number) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      return { osc, g };
    }

    const hi = buildTone(ALARM_HI);
    const lo = buildTone(ALARM_LO);
    oscillatorsRef.current = [hi.osc, lo.osc];

    function tick() {
      const t = ctx.currentTime;
      phase = (phase + 0.016 / CYCLE) % 1;
      const hiVol = phase < 0.5 ? 1 : 0;
      const loVol = phase >= 0.5 ? 1 : 0;
      hi.g.gain.setTargetAtTime(hiVol * 0.18, t, 0.04);
      lo.g.gain.setTargetAtTime(loVol * 0.14, t, 0.04);
      animFrameRef.current = requestAnimationFrame(tick);
    }
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      oscillatorsRef.current.forEach(o => { try { o.stop(); } catch {} });
      ctx.close();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0000 0%, #000000 70%)',
        animation: 'lockdownPulse 1.2s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes lockdownPulse {
          0%, 100% { background: radial-gradient(ellipse at center, #1a0000 0%, #000000 70%); }
          50% { background: radial-gradient(ellipse at center, #2d0000 0%, #0a0000 70%); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.7; }
          94% { opacity: 1; }
          97% { opacity: 0.8; }
          98% { opacity: 1; }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px #dc2626); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 40px #ef4444) drop-shadow(0 0 80px #991b1b); }
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ animation: 'flicker 4s infinite' }}
      >
        <div
          className="absolute left-0 right-0 h-32 opacity-5"
          style={{
            background: 'linear-gradient(transparent, rgba(220,38,38,0.4), transparent)',
            animation: 'scanline 2.4s linear infinite',
          }}
        />
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${(i / 18) * 100}%`,
              height: '1px',
              background: 'rgba(220,38,38,0.06)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl mx-auto">
        <div style={{ animation: 'iconPulse 1.2s ease-in-out infinite' }}>
          <AlertOctagon className="w-28 h-28 mb-8" style={{ color: '#dc2626' }} />
        </div>

        <div
          className="font-mono text-xs tracking-[0.4em] mb-4 uppercase"
          style={{ color: '#ef4444', opacity: 0.7 }}
        >
          Error Code: SYS-CRITICAL-001
        </div>

        <h1
          className="font-black uppercase tracking-widest mb-6"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#ffffff',
            textShadow: '0 0 30px rgba(220,38,38,0.8), 0 0 60px rgba(220,38,38,0.4)',
            lineHeight: 1.1,
            letterSpacing: '0.05em',
          }}
        >
          Critical System<br />Malfunction
        </h1>

        <div
          className="w-32 h-0.5 mx-auto mb-8"
          style={{ background: 'linear-gradient(to right, transparent, #dc2626, transparent)' }}
        />

        <p
          className="text-lg font-light mb-4 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          We sincerely apologize. TurboAnswer has experienced a critical system failure and is temporarily unavailable.
        </p>
        <p
          className="text-base font-light mb-12"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Our engineering team has been notified and is working to restore service as quickly as possible. We appreciate your patience.
        </p>

        <div
          className="flex items-center gap-3 px-6 py-3 rounded-full border font-mono text-sm tracking-widest uppercase"
          style={{
            background: 'rgba(220,38,38,0.08)',
            borderColor: 'rgba(220,38,38,0.3)',
            color: '#ef4444',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: '#dc2626', boxShadow: '0 0 8px #dc2626', animation: 'iconPulse 0.6s ease-in-out infinite' }}
          />
          Service Interrupted — Restoration In Progress
        </div>

        <p
          className="mt-10 text-sm font-mono"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          support@turboanswer.it.com
        </p>
      </div>
    </div>
  );
}
