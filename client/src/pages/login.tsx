import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import TurboLogo from "@/components/TurboLogo";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    totpCode: "",
  });

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
          ...(requires2FA ? { totpCode: formData.totpCode } : {}),
        }),
      });

      const data = await response.json();

      if (response.ok && data.requires2FA) {
        setRequires2FA(true);
        toast({
          title: "2FA Required",
          description: "Please enter your authenticator code.",
        });
        return;
      }

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({
          title: "Welcome back!",
          description: "You're now signed in to Turbo Answer.",
        });
        setLocation("/");
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <TurboLogo size={48} animated={true} />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Welcome Back to TURBOANSWER
          </CardTitle>
          <CardDescription className="text-cyan-400 font-medium">
            NEVER STOP INNOVATING
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={requires2FA}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={requires2FA}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {requires2FA && (
              <div className="space-y-2">
                <Label htmlFor="totpCode" className="text-white">Authenticator Code</Label>
                <Input
                  id="totpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={formData.totpCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, totpCode: e.target.value.replace(/\D/g, "") }))}
                  required
                  autoFocus
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 text-center text-lg tracking-widest"
                />
                <p className="text-xs text-gray-400">Open your authenticator app to get the code</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? "Signing In..." : requires2FA ? "Verify & Sign In" : "Sign In"}
            </Button>

            {requires2FA && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={() => {
                  setRequires2FA(false);
                  setFormData(prev => ({ ...prev, totpCode: "" }));
                }}
              >
                Back to login
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-purple-400 hover:text-purple-300">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
