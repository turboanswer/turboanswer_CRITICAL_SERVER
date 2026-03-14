import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, ShieldCheck, Lock, Sparkles, Brain, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import TurboLogo from "@/components/TurboLogo";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

        try {
          const pending = localStorage.getItem("turbo_pending_subscription");
          if (pending) {
            const pendingData = JSON.parse(pending);
            if (Date.now() - pendingData.timestamp < 30 * 60 * 1000) {
              const syncRes = await fetch("/api/sync-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expectedTier: pendingData.tier, subscriptionId: pendingData.subscriptionId }),
                credentials: "include",
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (syncData.tier) {
                  localStorage.removeItem("turbo_pending_subscription");
                  queryClient.invalidateQueries({ queryKey: ["/api/models"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/subscription-status"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/enterprise-code"] });
                  toast({ title: "Subscription Activated!", description: `Your ${syncData.tier} plan is now active.` });
                }
              }
            } else {
              localStorage.removeItem("turbo_pending_subscription");
            }
          }
        } catch {}

        toast({ title: "Welcome back!", description: "You're now signed in to Turbo Answer." });
        setLocation("/chat");
      } else {
        toast({ title: "Error", description: data.message || "Invalid credentials", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Login failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row overflow-hidden">
      <style>{`
        @keyframes float-gentle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes gradient-flow { 0% { background-position: 0% center; } 50% { background-position: 200% center; } 100% { background-position: 0% center; } }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-0 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(66,133,244,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px]" style={{ background: "radial-gradient(circle, rgba(234,67,53,0.06) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-md text-center lg:text-left">
          <div className="flex justify-center lg:justify-start mb-8" style={{ animation: "float-gentle 6s ease-in-out infinite" }}>
            <TurboLogo size={72} animated={true} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4" style={{
            background: "linear-gradient(135deg, #4285F4 0%, #9B72CB 25%, #D96570 50%, #D96570 75%, #FFC857 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradient-flow 8s ease infinite",
          }}>
            Welcome back to TurboAnswer
          </h1>

          <p className="text-lg text-zinc-500 mb-8">
            Your AI that thinks, creates, and analyzes.
          </p>

          <div className="hidden lg:flex flex-col gap-3">
            {[
              { icon: Brain, text: "Advanced AI models for deep reasoning", color: "text-violet-400" },
              { icon: Zap, text: "Instant answers in 100+ languages", color: "text-cyan-400" },
              { icon: Sparkles, text: "Generate images, code, and more", color: "text-amber-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-0">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
            <p className="text-sm text-zinc-500 mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-white/[0.05] border-white/[0.08] text-white placeholder-zinc-600 rounded-xl h-11 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="bg-white/[0.05] border-white/[0.08] text-white placeholder-zinc-600 rounded-xl h-11 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #4285F4 0%, #7B68EE 50%, #9B72CB 100%)" }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight className="h-4 w-4" /></span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-blue-400 transition-colors">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="text-center text-sm text-zinc-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-zinc-600">
              <div className="flex items-center gap-1">
                <Lock size={10} className="text-green-500/60" />
                <span>AES-256 Encrypted</span>
              </div>
              <div className="w-px h-2.5 bg-zinc-800" />
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-blue-400/60" />
                <span>bcrypt Hashing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
