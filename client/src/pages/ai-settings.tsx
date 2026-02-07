import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Brain, Zap, CheckCircle, Star, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AI_MODELS = {
  "gemini-flash": {
    name: "Gemini 2.5 Flash",
    description: "Ultra-fast responses for everyday questions. Lightning speed with great quality.",
    tier: "Free",
    icon: Zap,
    color: "from-green-500 to-emerald-600",
    borderColor: "border-green-600 hover:border-green-500",
    badgeClass: "bg-green-100 text-green-800",
    checkColor: "text-green-400",
  },
  "gemini-pro": {
    name: "Gemini 2.5 Flash Pro",
    description: "Premium quality responses with detailed, thorough answers for complex topics.",
    tier: "Pro - $6.99/mo",
    icon: Star,
    color: "from-purple-500 to-pink-600",
    borderColor: "border-purple-600 hover:border-purple-500",
    badgeClass: "bg-purple-100 text-purple-800",
    checkColor: "text-purple-400",
  },
  "claude-research": {
    name: "Gemini 2.5 Pro Research",
    description: "Most powerful model for deep research, comprehensive analysis, and expert-level detail.",
    tier: "Research - $15/mo",
    icon: FlaskConical,
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-600 hover:border-blue-500",
    badgeClass: "bg-blue-100 text-blue-800",
    checkColor: "text-blue-400",
  },
};

export default function AISettings() {
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedAIModel') || 'gemini-flash';
  });

  useEffect(() => {
    localStorage.setItem('selectedAIModel', selectedModel);
  }, [selectedModel]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl font-semibold">AI Model</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Choose Your AI Model</h2>
          <p className="text-gray-400">Select the model that fits your needs</p>
        </div>

        <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-4">
          {Object.entries(AI_MODELS).map(([key, model]) => {
            const Icon = model.icon;
            const isSelected = selectedModel === key;
            return (
              <Card key={key} className={`bg-gray-900 ${isSelected ? model.borderColor.split(' ')[0].replace('border', 'border-2 border') : 'border-gray-700'} ${model.borderColor.split(' ').slice(1).join(' ')} transition-all cursor-pointer`}>
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={key} className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-lg">{model.name}</span>
                          <Badge variant="secondary" className={model.badgeClass}>
                            {model.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {model.description}
                        </p>
                      </Label>
                    </div>
                    {isSelected && (
                      <CheckCircle className={`h-5 w-5 ${model.checkColor} mt-1 flex-shrink-0`} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </RadioGroup>
      </main>
    </div>
  );
}
