import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Zap, ArrowLeft, X } from 'lucide-react';
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

  const monthlyPrice = "$6.99";
  const yearlyPrice = "$130";
  const yearlyMonthly = "$10.83";

  return (
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0d0d0d]">
        <Link href="/">
          <div className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm hidden sm:inline">Back</span>
          </div>
        </Link>
        <h1 className="text-base font-semibold">Plans & Pricing</h1>
        <button
          onClick={() => setShowPromo(!showPromo)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Promo code
        </button>
      </div>

      {/* Promo Code Bar */}
      {showPromo && (
        <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm"
            />
            <button
              onClick={() => applyPromoMutation.mutate({ promoCode })}
              disabled={!promoCode.trim() || applyPromoMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {applyPromoMutation.isPending ? '...' : 'Apply'}
            </button>
            <button onClick={() => setShowPromo(false)} className="text-gray-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-1 mb-6 bg-[#0d0d0d] rounded-xl p-1 max-w-xs mx-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${
              billingCycle === 'monthly' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${
              billingCycle === 'yearly' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500'
            }`}
          >
            Yearly
            <span className="ml-1 text-[10px] text-green-400 font-bold">-45%</span>
          </button>
        </div>

        {/* Free Plan */}
        <div className="bg-[#212121] border border-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">Free</h3>
              <p className="text-2xl font-bold mt-1">$0 <span className="text-sm font-normal text-gray-500">forever</span></p>
            </div>
            <Link href="/">
              <button className="px-5 py-2 bg-[#333] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#3a3a3a]">
                Current Plan
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {["50 messages/day", "Auto AI server", "Basic history", "Math & calculations", "General knowledge"].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <Check className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-b from-[#1c1c30] to-[#212121] border-2 border-blue-500/30 rounded-2xl p-5 mb-6 relative">
          <div className="absolute -top-2.5 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
            Recommended
          </div>

          <div className="flex items-center justify-between mb-4 mt-1">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                Premium <Crown className="h-4 w-4 text-yellow-400" />
              </h3>
              <p className="text-2xl font-bold mt-1">
                {billingCycle === 'monthly' ? monthlyPrice : yearlyPrice}
                <span className="text-sm font-normal text-gray-500">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </p>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-green-400 mt-0.5">{yearlyMonthly}/mo &mdash; save $53.88/yr</p>
              )}
            </div>
            <button
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Payment is being set up. Use a promo code for now!",
                });
              }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              Upgrade
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Unlimited messages",
              "All 5 AI servers",
              "Camera vision",
              "15+ code languages",
              "Priority speed",
              "Export conversations",
              "Custom AI personality",
              "30+ languages",
              "Voice features",
              "Document analysis",
              "Ad-free",
              "Early access",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-200">
                <Zap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-[#212121] border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold">Compare Plans</h2>
          </div>
          <div className="divide-y divide-gray-800/50">
            {[
              ["Daily messages", "50", "Unlimited"],
              ["AI servers", "1", "All 5"],
              ["Camera vision", "—", "Yes"],
              ["Code languages", "Basic", "15+"],
              ["Response speed", "Normal", "Priority"],
              ["Export chats", "—", "Yes"],
              ["Custom personality", "—", "Yes"],
              ["Languages", "English", "30+"],
              ["Voice features", "—", "Yes"],
              ["Doc analysis", "—", "Yes"],
            ].map(([feature, free, premium], i) => (
              <div key={i} className="flex items-center px-4 py-2.5 text-sm">
                <span className="flex-1 text-gray-400">{feature}</span>
                <span className="w-16 text-center text-gray-600 text-xs">{free}</span>
                <span className="w-20 text-center text-white text-xs font-medium">{premium}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-semibold text-center mb-4">FAQ</h2>
          {[
            { q: "Can I cancel anytime?", a: "Yes. You keep premium until your billing period ends." },
            { q: "Is there a free trial?", a: "The free plan is yours forever. Use a promo code to unlock premium instantly." },
            { q: "What makes Turbo Answer different?", a: "It runs entirely on your own server — private, instant, no external APIs." },
          ].map(({ q, a }, i) => (
            <div key={i} className="bg-[#212121] border border-gray-800 rounded-xl px-4 py-3">
              <h3 className="text-sm font-medium text-white mb-1">{q}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
