import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sparkles, MessageSquare, Zap, Brain, ArrowRight } from "lucide-react";
import TurboLogo from "@/components/TurboLogo";

function FloatingOrb({ delay, duration, color, size, startX, startY }: {
  delay: number; duration: number; color: string; size: number; startX: number; startY: number;
}) {
  return (
    <div
      className="absolute rounded-full opacity-40 blur-xl pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: `${startX}%`,
        top: `${startY}%`,
        animation: `floatOrb ${duration}s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

export default function MobileWelcome() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step < 3) {
      const t = setTimeout(() => setStep(s => s + 1), 600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const features = [
    { icon: Brain, label: "Advanced AI Models", color: "from-violet-500 to-purple-600" },
    { icon: Zap, label: "Instant Answers", color: "from-cyan-400 to-blue-500" },
    { icon: Sparkles, label: "5 Free Trial Questions", color: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex flex-col items-center justify-center px-6">
      <style>{`
        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.2); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(15px, -15px) scale(1.1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-slide-up { animation: slideUp 0.7s ease-out forwards; }
        .gradient-shift { 
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
      `}</style>

      <FloatingOrb delay={0} duration={8} color="radial-gradient(circle, rgba(139,92,246,0.6), transparent)" size={200} startX={10} startY={15} />
      <FloatingOrb delay={1} duration={10} color="radial-gradient(circle, rgba(6,182,212,0.5), transparent)" size={160} startX={70} startY={10} />
      <FloatingOrb delay={2} duration={12} color="radial-gradient(circle, rgba(236,72,153,0.4), transparent)" size={180} startX={20} startY={65} />
      <FloatingOrb delay={0.5} duration={9} color="radial-gradient(circle, rgba(59,130,246,0.5), transparent)" size={140} startX={75} startY={60} />
      <FloatingOrb delay={1.5} duration={11} color="radial-gradient(circle, rgba(245,158,11,0.3), transparent)" size={120} startX={50} startY={35} />
      <FloatingOrb delay={3} duration={7} color="radial-gradient(circle, rgba(16,185,129,0.4), transparent)" size={100} startX={85} startY={80} />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        <div
          className="mb-8 transition-all duration-1000"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.5)",
            animation: visible ? "pulseGlow 3s ease-in-out infinite" : "none",
            borderRadius: "50%",
            padding: 20,
          }}
        >
          <TurboLogo size={80} animated={true} />
        </div>

        <h1
          className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent gradient-shift"
          style={{
            backgroundImage: "linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899, #f59e0b, #a78bfa)",
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease-out",
          }}
        >
          TURBOANSWER
        </h1>

        <p
          className="text-lg text-gray-300 mb-2 font-medium tracking-wide"
          style={{
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease-out 0.15s",
          }}
        >
          Your AI-Powered Assistant
        </p>

        <p
          className="text-sm text-gray-500 mb-10"
          style={{
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.6s ease-out",
          }}
        >
          Ask anything. Get expert answers instantly.
        </p>

        <div className="w-full space-y-3 mb-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/10 backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                opacity: step >= 2 ? 1 : 0,
                transform: step >= 2 ? "translateX(0)" : "translateX(-30px)",
                transition: `all 0.6s ease-out ${i * 0.15}s`,
              }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                <f.icon size={20} className="text-white" />
              </div>
              <span className="text-white font-medium text-sm">{f.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setLocation("/trial-chat")}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg relative overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)",
            backgroundSize: "200% 200%",
            animation: step >= 3 ? "gradientShift 3s ease infinite" : "none",
            opacity: step >= 3 ? 1 : 0,
            transform: step >= 3 ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <MessageSquare size={20} />
            Try It Free
            <ArrowRight size={18} className="group-active:translate-x-1 transition-transform" />
          </span>
        </button>

        <button
          onClick={() => setLocation("/login")}
          className="mt-4 text-sm text-gray-400 active:text-purple-400 transition-colors"
          style={{
            opacity: step >= 3 ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.3s",
          }}
        >
          Already have an account? <span className="text-purple-400 font-medium">Sign in</span>
        </button>
      </div>
    </div>
  );
}
