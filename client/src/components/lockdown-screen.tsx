import { useEffect, useRef } from 'react';

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

    const t1 = setTimeout(() => { if (!playingRef.current) attemptPlay(); }, 600);
    const t2 = setTimeout(() => { if (!playingRef.current) attemptPlay(); }, 1500);

    const onInteract = () => handleUserGesture();
    document.addEventListener('mousedown',   onInteract);
    document.addEventListener('pointerdown', onInteract);
    document.addEventListener('touchstart',  onInteract);
    document.addEventListener('keydown',     onInteract);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      document.removeEventListener('mousedown',   onInteract);
      document.removeEventListener('pointerdown', onInteract);
      document.removeEventListener('touchstart',  onInteract);
      document.removeEventListener('keydown',     onInteract);
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
      <svg
        viewBox="0 0 420 340"
        style={{ width: 'min(420px, 80vw)', marginBottom: '2rem', overflow: 'visible' }}
        aria-hidden="true"
      >
        <ellipse cx="210" cy="330" rx="130" ry="10" fill="rgba(255,0,0,0.08)" />
        <g transform="rotate(28, 210, 200)">
          <rect x="148" y="258" width="30" height="72" rx="7" fill="#1e1e1e" stroke="#3a3a3a" strokeWidth="1.5" transform="rotate(-18, 163, 294)" />
          <rect x="148" y="322" width="30" height="14" rx="4" fill="#252525" stroke="#444" strokeWidth="1.5" transform="rotate(-18, 163, 329)" />
          <rect x="182" y="260" width="30" height="72" rx="7" fill="#1e1e1e" stroke="#3a3a3a" strokeWidth="1.5" transform="rotate(22, 197, 296)" />
          <rect x="182" y="324" width="30" height="14" rx="4" fill="#252525" stroke="#444" strokeWidth="1.5" transform="rotate(22, 197, 331)" />
          <circle cx="162" cy="262" r="9" fill="#141414" stroke="#3a3a3a" strokeWidth="1.5" />
          <circle cx="198" cy="264" r="9" fill="#141414" stroke="#3a3a3a" strokeWidth="1.5" />
          <rect x="130" y="155" width="100" height="108" rx="12" fill="#1a1a1a" stroke="#3d3d3d" strokeWidth="2" />
          <rect x="85" y="158" width="44" height="52" rx="5" fill="#111" stroke="#555" strokeWidth="1.5" transform="rotate(-50, 131, 175)" />
          <circle cx="131" cy="162" r="3" fill="#555" />
          <rect x="136" y="165" width="82" height="86" rx="5" fill="#040c04" stroke="#1a3a1a" strokeWidth="1" />
          <line x1="146" y1="178" x2="208" y2="178" stroke="#00cc55" strokeWidth="1.2" opacity="0.7" />
          <line x1="146" y1="188" x2="190" y2="188" stroke="#00cc55" strokeWidth="1" opacity="0.5" />
          <line x1="158" y1="178" x2="158" y2="238" stroke="#00cc55" strokeWidth="1" opacity="0.6" />
          <line x1="178" y1="188" x2="178" y2="235" stroke="#00cc55" strokeWidth="1" opacity="0.4" />
          <line x1="195" y1="178" x2="195" y2="220" stroke="#00cc55" strokeWidth="1" opacity="0.5" />
          <rect x="165" y="198" width="22" height="14" rx="2" fill="#001a00" stroke="#00cc55" strokeWidth="1" opacity="0.7" />
          <circle cx="158" cy="178" r="3.5" fill="#00cc55" opacity="0.9" />
          <circle cx="178" cy="188" r="3.5" fill="#00cc55" opacity="0.7" />
          <circle cx="195" cy="178" r="3" fill="#00cc55" opacity="0.8" />
          <circle cx="200" cy="215" r="5" fill="#cc0000" opacity="0.85" />
          <rect x="52" y="148" width="78" height="24" rx="9" fill="#1e1e1e" stroke="#3a3a3a" strokeWidth="1.5" transform="rotate(-30, 130, 160)" />
          <rect x="40" y="138" width="18" height="24" rx="6" fill="#252525" stroke="#444" strokeWidth="1.5" transform="rotate(-30, 49, 150)" />
          <rect x="230" y="158" width="78" height="24" rx="9" fill="#1e1e1e" stroke="#3a3a3a" strokeWidth="1.5" transform="rotate(18, 230, 170)" />
          <rect x="304" y="160" width="18" height="24" rx="6" fill="#252525" stroke="#444" strokeWidth="1.5" transform="rotate(18, 313, 172)" />
          <circle cx="130" cy="162" r="11" fill="#141414" stroke="#444" strokeWidth="1.5" />
          <circle cx="230" cy="170" r="11" fill="#141414" stroke="#444" strokeWidth="1.5" />
          <rect x="153" y="144" width="28" height="14" rx="5" fill="#191919" stroke="#3a3a3a" strokeWidth="1.5" />
          <rect x="133" y="80" width="94" height="68" rx="12" fill="#1a1a1a" stroke="#3d3d3d" strokeWidth="2" />
          <rect x="142" y="98" width="76" height="22" rx="6" fill="#180000" stroke="#3a3a3a" strokeWidth="1" />
          <rect x="146" y="101" width="22" height="16" rx="4" fill="#220000" opacity="0.5" />
          <rect x="192" y="101" width="22" height="16" rx="4" fill="#6b0000" opacity="0.8" />
          <rect x="196" y="104" width="14" height="10" rx="2" fill="#cc0000" opacity="0.5" />
          <polyline points="172,96 176,108 170,120" stroke="#0a0a0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="155" y="130" width="50" height="8" rx="3" fill="#111" stroke="#333" strokeWidth="1" />
          <line x1="165" y1="130" x2="165" y2="138" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="175" y1="130" x2="175" y2="138" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="185" y1="130" x2="185" y2="138" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="195" y1="130" x2="195" y2="138" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="180" y1="80" x2="176" y2="58" stroke="#3a3a3a" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="176" y1="58" x2="160" y2="44" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="160" cy="43" r="5" fill="#252525" stroke="#444" strokeWidth="1.5" />
        </g>
        {/* Electric bolt */}
        <g>
          <polyline points="108,188 88,205 112,216 85,238 114,234 92,262" stroke="#FFD700" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.15" />
          <polyline points="108,188 88,205 112,216 85,238 114,234 92,262" stroke="#FFD700" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35" />
          <polyline points="108,188 88,205 112,216 85,238 114,234 92,262" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polyline points="108,188 88,205 112,216 85,238 114,234 92,262" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
          <line x1="88" y1="205" x2="72" y2="196" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1="88" y1="205" x2="74" y2="218" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="85" y1="238" x2="66" y2="232" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1="85" y1="238" x2="70" y2="250" stroke="#FFE066" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="92" y1="262" x2="76" y2="270" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <circle cx="70" cy="196" r="2.5" fill="#FFD700" opacity="0.9" />
          <circle cx="63" cy="233" r="2" fill="#FFE066" opacity="0.8" />
          <circle cx="74" cy="271" r="2.5" fill="#FFD700" opacity="0.7" />
        </g>
      </svg>

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
