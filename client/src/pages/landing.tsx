import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Brain, FileText, Globe, Shield, MessageSquare, Menu, X, QrCode, ImageIcon, Camera, Sparkles, ArrowRight, Check, Star } from "lucide-react";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Turbo Answer</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <a href="#features" className="text-sm text-gray-400 hover:text-white px-3 py-1.5">Features</a>
            <a href="#mobile" className="text-sm text-gray-400 hover:text-white px-3 py-1.5">Mobile</a>
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Pricing
              </Button>
            </Link>
            <a href="/api/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold px-5">
                Get Started Free
              </Button>
            </a>
          </div>

          <button
            className="sm:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-800 bg-black/95 px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Features
              </Button>
            </a>
            <a href="#mobile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Mobile
              </Button>
            </a>
            <Link href="/pricing">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Button>
            </Link>
            <a href="/api/login" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">
                Get Started Free
              </Button>
            </a>
          </div>
        )}
      </nav>

      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Multi-Model AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Your AI That<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Thinks, Creates &amp; Analyzes
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Chat naturally. Analyze documents instantly. Generate stunning images. 
            All in one powerful AI assistant that works on any device.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/api/login">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 font-semibold shadow-lg shadow-blue-500/25">
                Start For Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-6" onClick={() => setShowQR(true)}>
              <QrCode className="h-5 w-5 mr-2" />
              Open on Phone
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-400" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-400" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-400" /> Works on mobile
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 relative z-10">
          <div className="rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 p-1 ring-1 ring-white/10 shadow-2xl shadow-blue-500/10">
            <div className="bg-gray-950 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 ml-2">Turbo Answer</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-xl rounded-tl-sm p-3 text-sm text-gray-300 max-w-[80%]">
                    Analyze this contract and generate a visual summary
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl rounded-tr-sm p-4 text-sm text-gray-200 max-w-[85%] border border-blue-800/30">
                    <p className="mb-2">I've analyzed the contract. Here are the key findings:</p>
                    <p className="text-gray-400 text-xs">1. Payment terms: Net-30 with 2% early discount</p>
                    <p className="text-gray-400 text-xs">2. Liability cap: $500,000</p>
                    <p className="text-gray-400 text-xs">3. Auto-renewal: 12-month cycle</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
                      <ImageIcon className="h-3 w-3" />
                      <span>Visual summary generated</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need in{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">One Place</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Powerful features designed to make your life easier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-b from-gray-900 to-gray-900/50 border-gray-800 hover:border-blue-800/50 group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Multi-Model AI Chat</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Access the best AI models including Gemini 2.5 Flash for instant, intelligent conversations on any topic.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-gray-900 to-gray-900/50 border-gray-800 hover:border-green-800/50 group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Document Analysis</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Upload any document and get instant summaries, key insights, and answers. Supports TXT, CSV, JSON, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-gray-900 to-gray-900/50 border-gray-800 hover:border-pink-800/50 group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20">
                  <ImageIcon className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold">AI Image Creation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Generate stunning images from text descriptions. Create art, designs, and visuals with a single prompt.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-gray-900 to-gray-900/50 border-gray-800 hover:border-purple-800/50 group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20">
                  <Globe className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">Multilingual Support</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Chat in any language with automatic detection and native-quality responses across the world.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-gray-900 to-gray-900/50 border-gray-800 hover:border-orange-800/50 group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20">
                  <Camera className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold">Camera Vision</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Point your camera at anything and get instant AI analysis. Identify objects, read text, and understand the world.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-gray-900 to-gray-900/50 border-gray-800 hover:border-cyan-800/50 group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">Ultra-Fast Responses</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Get answers in milliseconds with our optimized AI pipeline. No waiting, no lag, just instant intelligence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-black via-blue-950/10 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                AI That Actually{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Understands</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Turbo Answer doesn't just respond -- it thinks. Using multiple AI models working together, 
                you get smarter, more accurate, and more helpful answers than any single AI can provide.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Star className="h-4 w-4 text-yellow-400" />, text: "Smart model selection picks the best AI for your question" },
                  { icon: <Shield className="h-4 w-4 text-green-400" />, text: "Your data stays private and secure" },
                  { icon: <Sparkles className="h-4 w-4 text-purple-400" />, text: "Continuous learning improves with every conversation" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <a href="/api/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 mt-4">
                  Try It Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 ring-1 ring-white/5">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <Brain className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="text-sm font-medium">Gemini 2.5 Flash</div>
                      <div className="text-xs text-gray-500">Primary reasoning engine</div>
                    </div>
                    <div className="ml-auto text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Active</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Response Time", value: "<1s", color: "text-green-400" },
                      { label: "Accuracy", value: "99.2%", color: "text-blue-400" },
                      { label: "Languages", value: "100+", color: "text-purple-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-800/50 rounded-xl p-3 text-center">
                        <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mobile" className="py-16 sm:py-24 px-4">
        <div className="max-w-lg mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Take It{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Everywhere</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Scan the QR code with your phone camera to instantly access Turbo Answer on any mobile device.
          </p>
          
          {!showQR ? (
            <Button
              onClick={() => setShowQR(true)}
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 gap-2 px-8"
            >
              <QrCode className="h-5 w-5" />
              Show QR Code
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-2xl shadow-purple-500/10">
                <QRCodeSVG
                  value={appUrl}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 break-all max-w-xs">{appUrl}</p>
              <Button onClick={() => setShowQR(false)} variant="ghost" size="sm" className="text-gray-400">
                Hide QR Code
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-8 sm:p-12 border border-blue-500/10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands who are already using Turbo Answer to work smarter, learn faster, and create more.
            </p>
            <a href="/api/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-6 font-semibold shadow-lg shadow-blue-500/25">
                Get Started -- It's Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold">Turbo Answer</span>
            <span className="text-xs text-gray-600 ml-2">The AI that gets it done</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy-policy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/support" className="hover:text-gray-300">Support</Link>
            <Link href="/business" className="hover:text-gray-300">Business</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
