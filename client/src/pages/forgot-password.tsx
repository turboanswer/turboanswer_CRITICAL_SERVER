import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import TurboLogo from "@/components/TurboLogo";
import { Mail, ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        toast({
          title: "Code sent",
          description: "Check your email for the 6-digit verification code.",
        });
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not send code. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserId(data.userId);
        setStep("password");
      } else {
        toast({ title: "Incorrect code", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Verification failed. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep("done");
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Password reset failed. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: "email", label: "Email", icon: Mail },
    { id: "otp", label: "Verify", icon: ShieldCheck },
    { id: "password", label: "New Password", icon: Lock },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <TurboLogo size={48} animated={true} />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-gray-400">
            We'll send a verification code to confirm it's you
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step !== "done" && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isComplete = i < currentStepIndex;
                const isActive = i === currentStepIndex;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      isComplete ? "border-purple-500 bg-purple-500 text-white" :
                      isActive ? "border-purple-400 bg-purple-900 text-purple-300" :
                      "border-gray-700 bg-gray-800 text-gray-500"
                    }`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-xs hidden sm:block ${isActive ? "text-purple-300" : isComplete ? "text-purple-400" : "text-gray-600"}`}>
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${i < currentStepIndex ? "bg-purple-500" : "bg-gray-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500">We'll send a 6-digit code to verify your identity.</p>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-gray-300 flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 flex items-start gap-2">
                <ShieldCheck size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <span>A 6-digit code was sent to <strong className="text-white">{email}</strong>. Enter it below to verify it's you.</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">Verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-gray-500">Code expires in 10 minutes.</p>
              </div>
              <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); }}
                className="w-full text-sm text-gray-400 hover:text-gray-300 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Use a different email
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 text-sm text-green-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                Identity verified. Set your new password below.
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {isLoading ? "Saving..." : "Set New Password"}
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-900/40 border-2 border-green-500 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                <p className="text-gray-400 text-sm">Your password has been changed successfully. You can now sign in with your new password.</p>
              </div>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
