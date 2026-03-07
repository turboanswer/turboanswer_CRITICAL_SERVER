import { useEffect, useRef } from 'react';
import lockdownRobotImg from '@assets/lockdown-robot.png';

// ── Scenario definitions ────────────────────────────────────────────────────
export type LockdownScenario = 'system_failure' | 'security_breach' | 'public_safety' | 'malfunction';

export const SCENARIOS: Record<LockdownScenario, { label: string; heading: string; body: string; voice: string }> = {
  system_failure: {
    label: 'Critical System Failure',
    heading: 'System Lockdown',
    body: 'TurboAnswer has experienced a brutal hack and catastrophic system malfunction. Critical security breach detected. Emergency protocols have been activated.',
    voice:
      'Warning. TurboAnswer has experienced a brutal hack, and catastrophic system malfunction. ' +
      'Critical security breach detected. All systems are now offline. ' +
      'Emergency protocols have been activated. Our engineers are responding. Please stand by.',
  },
  security_breach: {
    label: 'Security Breach / Hijack',
    heading: 'Security Breach Detected',
    body: 'TurboAnswer has been hijacked by an unauthorized party. All systems have been locked down. A full security investigation is underway. Law enforcement has been notified.',
    voice:
      'Attention. TurboAnswer has been hijacked by an unauthorized party. ' +
      'All systems have been locked down immediately. ' +
      'A full security investigation is now underway. ' +
      'Law enforcement has been notified and is actively responding. ' +
      'Do not attempt to access this platform until further notice.',
  },
  public_safety: {
    label: 'Threat to Public Safety',
    heading: 'Public Safety Alert',
    body: 'A credible threat to public safety has been detected through this platform. All services have been immediately suspended. Relevant authorities have been contacted and are responding. If you are in danger, call 911 now.',
    voice:
      'Critical public safety alert. ' +
      'Threatening content has been detected on this platform. ' +
      'All services have been immediately suspended. ' +
      'Relevant law enforcement authorities have been contacted and are actively responding. ' +
      'If you or someone you know is in immediate danger, ' +
      'call nine one one immediately. Do not delay.',
  },
  malfunction: {
    label: 'System Malfunction',
    heading: 'System Malfunction',
    body: 'TurboAnswer is experiencing a critical operational failure across all services. Emergency response teams have been deployed. Service restoration is underway.',
    voice:
      'System malfunction detected. ' +
      'TurboAnswer is experiencing a critical operational failure across all services. ' +
      'Emergency response teams have been deployed. ' +
      'Service restoration is currently underway. ' +
      'We apologize for the disruption and ask for your patience.',
  },
};

// ── Audio reverb helper ────────────────────────────────────────────────────
function makeReverb(ctx: AudioContext, duration = 4, decay = 2.5): ConvolverNode {
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  const node = ctx.createConvolver();
  node.buffer = impulse;
  return node;
}

// ── Horror alarm synthesizer ───────────────────────────────────────────────
function buildHorrorAlarm(ctx: AudioContext): () => void {
  const master = ctx.createGain();
  master.gain.value = 0.75;
  master.connect(ctx.destination);

  const reverb = makeReverb(ctx, 5, 2.2);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.4;
  reverb.connect(reverbGain);
  reverbGain.connect(master);

  function wire(node: AudioNode) { node.connect(master); node.connect(reverb); }

  const droneA = ctx.createOscillator();
  droneA.type = 'sine'; droneA.frequency.value = 58;
  const droneAGain = ctx.createGain(); droneAGain.gain.value = 0.8;
  droneA.connect(droneAGain); droneAGain.connect(master); droneA.start();

  const droneB = ctx.createOscillator();
  droneB.type = 'sine'; droneB.frequency.value = 61.5;
  const droneBGain = ctx.createGain(); droneBGain.gain.value = 0.55;
  droneB.connect(droneBGain); droneBGain.connect(reverb); droneB.start();

  const sub = ctx.createOscillator();
  sub.type = 'sine'; sub.frequency.value = 28;
  const subGain = ctx.createGain(); subGain.gain.value = 0.65;
  sub.connect(subGain); subGain.connect(master); sub.start();

  const wail = ctx.createOscillator();
  wail.type = 'triangle'; wail.frequency.value = 90;
  const wailGain = ctx.createGain(); wailGain.gain.value = 0;
  wail.connect(wailGain); wire(wailGain); wail.start();

  const wail2 = ctx.createOscillator();
  wail2.type = 'triangle'; wail2.frequency.value = 88;
  const wail2Gain = ctx.createGain(); wail2Gain.gain.value = 0;
  wail2.connect(wail2Gain); wire(wail2Gain); wail2.start();

  const RISE = 10, HOLD = 2.5, FALL = 8, GAP = 2, CYCLE = RISE + HOLD + FALL + GAP;
  for (let i = 0; i < 30; i++) {
    const t = ctx.currentTime + i * CYCLE;
    wailGain.gain.setValueAtTime(0, t);
    wail2Gain.gain.setValueAtTime(0, t);
    wailGain.gain.linearRampToValueAtTime(0.65, t + 1.2);
    wail2Gain.gain.linearRampToValueAtTime(0.45, t + 1.2);
    wail.frequency.setValueAtTime(90, t);
    wail2.frequency.setValueAtTime(88, t);
    wail.frequency.exponentialRampToValueAtTime(360, t + RISE);
    wail2.frequency.exponentialRampToValueAtTime(355, t + RISE);
    wail.frequency.setValueAtTime(360, t + RISE);
    wail2.frequency.setValueAtTime(355, t + RISE);
    wail.frequency.exponentialRampToValueAtTime(90, t + RISE + HOLD + FALL);
    wail2.frequency.exponentialRampToValueAtTime(88, t + RISE + HOLD + FALL);
    wailGain.gain.setValueAtTime(0.65, t + RISE + HOLD + FALL - 1.0);
    wailGain.gain.linearRampToValueAtTime(0, t + RISE + HOLD + FALL);
    wail2Gain.gain.setValueAtTime(0.45, t + RISE + HOLD + FALL - 1.0);
    wail2Gain.gain.linearRampToValueAtTime(0, t + RISE + HOLD + FALL);
  }

  const whistle = ctx.createOscillator();
  whistle.type = 'sine'; whistle.frequency.value = 2800;
  const whistleGain = ctx.createGain(); whistleGain.gain.value = 0.055;
  whistle.connect(whistleGain); wire(whistleGain); whistle.start();

  const lfo = ctx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 0.18;
  const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 45;
  lfo.connect(lfoDepth); lfoDepth.connect(whistle.frequency); lfo.start();

  return () => {
    [droneA, droneB, sub, wail, wail2, whistle, lfo].forEach(o => { try { o.stop(); } catch {} });
    try { master.disconnect(); } catch {}
    try { ctx.close(); } catch {}
  };
}

// ── Pick the deepest male voice available ──────────────────────────────────
function pickMaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Named male voices (most reliable)
  const named = voices.find(v =>
    /google uk english male|daniel|fred|thomas|alex|oliver|bruce|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|junior|kathy|pipe organ|ralph|trinoids|whisper|zarvox/i.test(v.name)
    && !/female/i.test(v.name)
  );
  if (named) return named;
  // Any English voice that isn't explicitly female
  const english = voices.find(v =>
    /en[-_]/i.test(v.lang) &&
    !/female|samantha|victoria|karen|moira|tessa|fiona|veena|susan|allison|ava|evelyn|sara|siri/i.test(v.name)
  );
  return english || voices[0] || null;
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props { scenario?: string; }

export default function LockdownScreen({ scenario = 'system_failure' }: Props) {
  const sc = (SCENARIOS[scenario as LockdownScenario] ?? SCENARIOS.system_failure);

  const playingRef  = useRef(false);
  const stopRef     = useRef<(() => void) | null>(null);
  const voiceActive = useRef(false);

  // ── Voice ─────────────────────────────────────────────────────────────
  function doSpeak() {
    if (!window.speechSynthesis || voiceActive.current) return;
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(sc.voice);
    utt.rate   = 0.6;
    utt.pitch  = 0.05;   // as deep as the browser allows
    utt.volume = 1.0;

    const voice = pickMaleVoice();
    if (voice) utt.voice = voice;

    utt.onstart = () => { voiceActive.current = true; };
    utt.onend   = () => { voiceActive.current = false; setTimeout(doSpeak, 5000); };
    utt.onerror = () => { voiceActive.current = false; };

    window.speechSynthesis.speak(utt);
  }

  // ── Audio ──────────────────────────────────────────────────────────────
  async function attemptPlay() {
    if (playingRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      if (ctx.state === 'running') {
        playingRef.current = true;
        stopRef.current = buildHorrorAlarm(ctx);
      } else { ctx.close(); }
    } catch {}
  }

  function handleUserGesture() {
    doSpeak();
    if (playingRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctx.resume().then(() => {
        if (!playingRef.current && ctx.state === 'running') {
          playingRef.current = true;
          stopRef.current = buildHorrorAlarm(ctx);
        }
      });
    } catch {}
  }

  function restartAudio() {
    // Stop any existing audio, reset flag, restart immediately
    try { stopRef.current?.(); } catch {}
    stopRef.current = null;
    playingRef.current = false;
    attemptPlay();
  }

  useEffect(() => {
    // Attempt immediately — voice often works without gesture, audio needs it
    const tryVoice = () => {
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
      } else {
        doSpeak();
      }
    };
    tryVoice();
    attemptPlay();

    const t1 = setTimeout(() => { if (!playingRef.current) attemptPlay(); }, 300);
    const t2 = setTimeout(() => { if (!playingRef.current) attemptPlay(); }, 800);

    const onInteract = () => handleUserGesture();
    document.addEventListener('mousedown',   onInteract);
    document.addEventListener('pointerdown', onInteract);
    document.addEventListener('touchstart',  onInteract);
    document.addEventListener('keydown',     onInteract);

    // Re-sound alarm immediately when user returns to the tab/page
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        restartAudio();
        voiceActive.current = false;
        doSpeak();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      document.removeEventListener('mousedown',   onInteract);
      document.removeEventListener('pointerdown', onInteract);
      document.removeEventListener('touchstart',  onInteract);
      document.removeEventListener('keydown',     onInteract);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopRef.current?.();
      window.speechSynthesis?.cancel();
    };
  }, [scenario]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#000000' }}
      onClick={handleUserGesture}
    >
      {/* Fallen robot illustration */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <img
          src={lockdownRobotImg}
          alt="System failure"
          style={{
            width: 'min(320px, 70vw)',
            borderRadius: '12px',
            boxShadow: '0 0 60px rgba(200,0,0,0.4), 0 0 120px rgba(180,0,0,0.2)',
            filter: 'brightness(0.9) contrast(1.1)',
          }}
        />
        {/* Red pulsing glow overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '12px',
          background: 'radial-gradient(ellipse at center, rgba(200,0,0,0.15) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>

      {/* Text */}
      <div className="flex flex-col items-center text-center px-8 max-w-lg mx-auto gap-5">
        <h1
          className="font-black uppercase tracking-widest"
          style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: '#ffffff', lineHeight: 1.1 }}
        >
          {sc.heading}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.7 }}>
          {sc.body}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
          support@turboanswer.it.com · 866-467-7269
        </p>
      </div>
    </div>
  );
}
