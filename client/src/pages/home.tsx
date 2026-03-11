import { useState } from "react";
import { Link } from "wouter";
import { MessageSquare, Settings, Zap, Brain, Shield, LogOut, Heart, HandHeart, Code2, Sparkles, ArrowRight, X, Rocket, Film, ImageIcon, Camera, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

// Google's brand colors
const G_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

function GoogleDots({ size = 10 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-[3px] align-middle">
      {G_COLORS.map((c, i) => (
        <span key={i} style={{ width: size, height: size, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0 }} />
      ))}
    </span>
  );
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function Home() {
  const { user, logout, isLoggingOut } = useAuth();
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const displayName = user?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-blue-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">TurboAnswer</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Welcome, {displayName}</span>
          {user?.profileImageUrl && (
            <img src={user.profileImageUrl} alt={displayName} className="w-8 h-8 rounded-full ring-2 ring-blue-500/40" />
          )}
          <a href="/api/logout">
            <button className="p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/20 rounded-lg transition-colors" title="Logout">
              <LogOut size={16} className="text-red-400" />
            </button>
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Code Studio Hero Card ── */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08]">
          {/* Purple/cyan gradient background */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, #0a0a2e 0%, #0d0a2e 30%, #0a0d2e 60%, #0a0a1e 100%)"
          }} />
          {/* Glow orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "#8b5cf6" }} />
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15 blur-3xl" style={{ background: "#22d3ee" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-15 blur-3xl" style={{ background: "#a78bfa" }} />

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1">
                {/* Branding badges */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: "rgba(66,133,244,0.4)", background: "rgba(66,133,244,0.1)", color: "#4285F4" }}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Antigravity
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: "rgba(34,211,238,0.4)", background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>
                    <Code2 className="h-3.5 w-3.5" />
                    New
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight" style={{ background: "linear-gradient(135deg, #a78bfa, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Code Studio
                </h1>

                <p className="text-xl md:text-2xl font-semibold text-white/90 mb-2">
                  Build Full Apps from a Single Prompt
                </p>
                <p className="text-gray-400 mb-6 max-w-lg leading-relaxed">
                  Describe your idea in plain English. Gemini 3.1 Pro designs, writes, and builds your entire app — in seconds. No code required.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { label: "Full HTML/CSS/JS Apps", color: "#8b5cf6" },
                    { label: "Live Preview", color: "#22d3ee" },
                    { label: "One Prompt Build", color: "#a78bfa" },
                    { label: "Deploy Instantly", color: "#06b6d4" },
                  ].map(({ label, color }) => (
                    <span key={label} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                      {label}
                    </span>
                  ))}
                </div>

                <Link href="/code-studio">
                  <Button className="gap-2 px-6 py-3 text-base font-semibold rounded-xl text-white shadow-2xl" style={{
                    background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                  }}>
                    <Code2 className="h-5 w-5" />
                    Open Code Studio
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Visual: code icon large */}
              <div className="shrink-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl opacity-40 rounded-full" style={{ background: "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #a78bfa, #06b6d4, #8b5cf6)" }} />
                  <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(20px)" }}>
                    <Code2 className="w-20 h-20 md:w-28 md:h-28" style={{ color: "#a78bfa" }} />
                  </div>
                  {/* Floating color dots */}
                  {[
                    { color: "#4285F4", top: "-8px", right: "20px" },
                    { color: "#EA4335", top: "20px", right: "-8px" },
                    { color: "#FBBC05", bottom: "-8px", left: "20px" },
                    { color: "#34A853", bottom: "20px", left: "-8px" },
                  ].map((dot, i) => (
                    <div key={i} className="absolute w-4 h-4 rounded-full shadow-lg" style={{ background: dot.color, top: dot.top, right: dot.right, bottom: dot.bottom, left: dot.left, boxShadow: `0 0 12px ${dot.color}` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom stats bar */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "AI Models", value: "Gemini 3.1 Pro", color: "#4285F4" },
                { label: "Build Time", value: "< 30 seconds", color: "#22d3ee" },
                { label: "Languages", value: "8+ Supported", color: "#a78bfa" },
                { label: "Deploy", value: "Instant URL", color: "#06b6d4" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold" style={{ color }}>{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/chat">
            <div className="group relative rounded-2xl border border-white/[0.08] p-5 cursor-pointer overflow-hidden transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10" style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #0a0a20 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ background: "#4285F4" }} />
              <MessageSquare className="h-8 w-8 mb-3" style={{ color: "#4285F4" }} />
              <h3 className="text-lg font-bold text-white mb-1">Start Chatting</h3>
              <p className="text-sm text-gray-400">Talk to AI — fast, smart, multilingual</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>

          <Link href="/media-editor">
            <div className="group relative rounded-2xl border border-white/[0.08] p-5 cursor-pointer overflow-hidden transition-all hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10" style={{ background: "linear-gradient(135deg, #2e0d1a 0%, #0a0a20 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ background: "#EC4899" }} />
              <div className="flex items-center gap-2 mb-3">
                <Scissors className="h-8 w-8 text-rose-400" />
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(236,72,153,0.15)", color: "#F472B6", border: "1px solid rgba(236,72,153,0.3)" }}>CapCut Style</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Media Studio</h3>
              <p className="text-sm text-gray-400">Edit photos & videos with AI filters and Gemini</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-rose-400 transition-colors" />
            </div>
          </Link>

          <Link href="/photo-editor">
            <div className="group relative rounded-2xl border border-white/[0.08] p-5 cursor-pointer overflow-hidden transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10" style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #0a0a20 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ background: "#4285F4" }} />
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-8 w-8 text-blue-400" />
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(66,133,244,0.15)", color: "#4285F4", border: "1px solid rgba(66,133,244,0.3)" }}>Gemini Vision</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">AI Scanner</h3>
              <p className="text-sm text-gray-400">Scan documents, receipts & photos — AI reads & summarizes them</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>

          <Link href="/video-studio">
            <div className="group relative rounded-2xl border border-white/[0.08] p-5 cursor-pointer overflow-hidden transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10" style={{ background: "linear-gradient(135deg, #1a0d3e 0%, #0a0a20 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ background: "#FBBC05" }} />
              <Film className="h-8 w-8 mb-3 text-violet-400" />
              <h3 className="text-lg font-bold text-white mb-1">Video Studio</h3>
              <p className="text-sm text-gray-400">Create AI videos with Google Veo 3.1</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-violet-400 transition-colors" />
            </div>
          </Link>

          <Link href="/code-studio">
            <div className="group relative rounded-2xl border p-5 cursor-pointer overflow-hidden transition-all hover:shadow-xl" style={{ background: "linear-gradient(135deg, #0d1b0d 0%, #0a0a20 100%)", borderColor: "rgba(52,168,83,0.3)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 blur-2xl" style={{ background: "#34A853" }} />
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-8 w-8" style={{ color: "#34A853" }} />
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(52,168,83,0.15)", color: "#34A853", border: "1px solid rgba(52,168,83,0.3)" }}>7-day free trial</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Code Studio</h3>
              <p className="text-sm text-gray-400">Full AI IDE — build, run & deploy apps with one prompt</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-green-400 transition-colors" />
            </div>
          </Link>

          <Link href="/crisis-info">
            <div className="group relative rounded-2xl border border-white/[0.08] p-5 cursor-pointer overflow-hidden transition-all hover:border-pink-500/40" style={{ background: "linear-gradient(135deg, #2d0d1e 0%, #0a0a20 100%)" }}>
              <HandHeart className="h-8 w-8 mb-3 text-pink-400" />
              <h3 className="text-lg font-bold text-white mb-1">Crisis Support</h3>
              <p className="text-sm text-gray-400">24/7 private, encrypted mental health support</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-pink-400 transition-colors" />
            </div>
          </Link>

          <Link href="/ai-settings">
            <div className="group relative rounded-2xl border border-white/[0.08] p-5 cursor-pointer overflow-hidden transition-all hover:border-gray-600" style={{ background: "linear-gradient(135deg, #111118 0%, #0a0a14 100%)" }}>
              <Brain className="h-8 w-8 mb-3 text-gray-400" />
              <h3 className="text-lg font-bold text-white mb-1">AI Settings</h3>
              <p className="text-sm text-gray-400">Switch models, manage subscription</p>
              <ArrowRight className="h-4 w-4 mt-3 text-gray-600 group-hover:text-gray-300 transition-colors" />
            </div>
          </Link>
        </div>

        {/* ── How Antigravity Works ── */}
        <div className="rounded-2xl border border-white/[0.06] p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-bold text-white">How Code Studio Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Describe It", desc: "Type what you want to build in plain English", color: "#8b5cf6", icon: "💬" },
              { step: "2", title: "Antigravity Builds", desc: "Gemini 3.1 Pro architects the full app structure", color: "#4285F4", icon: "⚡" },
              { step: "3", title: "Code Appears", desc: "Files populate live in your editor — watch it build", color: "#a78bfa", icon: "⚡" },
              { step: "4", title: "Deploy", desc: "Get an instant public URL to share your live app", color: "#06b6d4", icon: "🚀" },
            ].map(({ step, title, desc, color, icon }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 font-bold" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  {icon}
                </div>
                <div className="text-xs font-bold mb-1" style={{ color }}>STEP {step}</div>
                <div className="text-sm font-semibold text-white mb-1">{title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom links ── */}
        <div className="flex flex-wrap justify-center gap-3 pb-4">
          <Link href="/pricing"><Button variant="outline" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">Pricing</Button></Link>
          <Link href="/support"><Button variant="outline" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">Support</Button></Link>
          {user?.isAdmin && <Link href="/admin"><Button variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">Admin Panel</Button></Link>}
        </div>
      </div>
    </div>
  );
}
