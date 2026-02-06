import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Zap, ArrowLeft, Camera, Code, Brain, Shield, Download, Palette, Globe, Headphones } from 'lucide-react';
import { Link } from 'wouter';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const applyPromoMutation = useMutation({
    mutationFn: async ({ promoCode }: { promoCode: string }) => {
      const demoUserResponse = await apiRequest('POST', '/api/create-demo-user', {});
      const demoUserData = await demoUserResponse.json();
      const demoUser = demoUserData.user;
      const promoResponse = await apiRequest('POST', '/api/apply-promo', {
        userId: demoUser.id,
        promoCode: promoCode.toUpperCase()
      });
      return await promoResponse.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success!", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setPromoCode('');
      setShowPromo(false);
    },
    onError: (error: any) => {
      toast({ title: "Invalid Code", description: error.message || "This promo code is not valid", variant: "destructive" });
    }
  });

  const freeFeatures = [
    "50 messages per day",
    "Auto AI server",
    "Basic conversation history",
    "Math & calculations",
    "General knowledge",
  ];

  const premiumFeatures = [
    { text: "Unlimited messages", icon: Zap },
    { text: "All 5 AI servers (Auto, Math, Code, Knowledge, Creative)", icon: Brain },
    { text: "Camera vision - solve problems by showing them", icon: Camera },
    { text: "Advanced code generation with 15+ languages", icon: Code },
    { text: "Priority response speed", icon: Zap },
    { text: "Export & download conversations", icon: Download },
    { text: "Custom AI personality modes", icon: Palette },
    { text: "Multi-language support (30+ languages)", icon: Globe },
    { text: "Voice input & text-to-speech", icon: Headphones },
    { text: "Document & file analysis", icon: Shield },
    { text: "Ad-free experience", icon: Shield },
    { text: "Early access to new features", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to chat</span>
            </div>
          </Link>
          <button
            onClick={() => setShowPromo(!showPromo)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Have a promo code?
          </button>
        </div>
      </div>

      {/* Promo Code */}
      {showPromo && (
        <div className="border-b border-gray-800 px-6 py-4 bg-[#111]">
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm"
            />
            <button
              onClick={() => applyPromoMutation.mutate({ promoCode })}
              disabled={!promoCode.trim() || applyPromoMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {applyPromoMutation.isPending ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Upgrade to Premium</h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Unlock the full power of Turbo Answer with premium features
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              billingCycle === 'monthly' ? 'bg-white text-black' : 'bg-[#212121] text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              billingCycle === 'yearly' ? 'bg-white text-black' : 'bg-[#212121] text-gray-400'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-xs text-green-400 font-semibold">Save 45%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#171717] border border-gray-800 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 text-sm">forever</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Get started with basic AI</p>
            </div>

            <Link href="/">
              <button className="w-full py-3 bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-xl text-sm font-medium mb-6">
                Current Plan
              </button>
            </Link>

            <div className="space-y-3">
              {freeFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#171717] border-2 border-blue-500/40 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Premium
                <Crown className="h-4 w-4 text-yellow-400" />
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  {billingCycle === 'monthly' ? '$6.99' : '$130'}
                </span>
                <span className="text-gray-500 text-sm">
                  {billingCycle === 'monthly' ? '/month' : '/year'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-green-400 text-xs mt-1">That's just $10.83/month - save $53.88/year!</p>
              )}
              <p className="text-gray-500 text-sm mt-2">Full access to everything</p>
            </div>

            <button
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Payment processing is being set up. Use a promo code for now!",
                });
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium mb-6"
            >
              Upgrade to Premium
            </button>

            <div className="space-y-3">
              {premiumFeatures.map(({ text, icon: Icon }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Icon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-200">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="bg-[#171717] rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Feature</th>
                  <th className="px-6 py-4 text-sm text-gray-400 font-medium text-center">Free</th>
                  <th className="px-6 py-4 text-sm text-blue-400 font-medium text-center">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Daily messages", "50", "Unlimited"],
                  ["AI servers", "1 (Auto)", "All 5"],
                  ["Camera vision", "No", "Yes"],
                  ["Code generation", "Basic", "Advanced (15+ languages)"],
                  ["Response speed", "Standard", "Priority"],
                  ["Conversation export", "No", "Yes"],
                  ["Custom AI personality", "No", "Yes"],
                  ["Language support", "English", "30+ languages"],
                  ["Voice features", "No", "Yes"],
                  ["Document analysis", "No", "Yes"],
                ].map(([feature, free, premium], i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="px-6 py-3 text-sm text-gray-300">{feature}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 text-center">{free}</td>
                    <td className="px-6 py-3 text-sm text-white text-center font-medium">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You'll keep premium access until the end of your billing period." },
              { q: "Is there a free trial?", a: "You can use the free tier forever. If you have a promo code, you can unlock premium features instantly." },
              { q: "What makes this AI different?", a: "Turbo Answer runs entirely on your own server - your data stays private, responses are instant, and there are no external API dependencies." },
              { q: "How do promo codes work?", a: "Enter your promo code at the top of this page. Valid codes instantly upgrade your account to premium." },
            ].map(({ q, a }, i) => (
              <div key={i} className="bg-[#171717] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">{q}</h3>
                <p className="text-sm text-gray-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
