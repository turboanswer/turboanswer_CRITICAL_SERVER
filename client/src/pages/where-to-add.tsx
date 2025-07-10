import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WhereToAdd() {
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const code = `<script src="https://turbo-answer-ai.uc.r.appspot.com/widget/turbo-widget.js"></script>
<script>TurboWidget.init();</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const platforms = [
    {
      name: "WordPress",
      icon: "🟦",
      steps: [
        "Go to Appearance → Theme Editor",
        "Click footer.php",
        "Find </body>",
        "Paste code RIGHT BEFORE </body>",
        "Click Update File"
      ]
    },
    {
      name: "Shopify",
      icon: "🟩",
      steps: [
        "Go to Online Store → Themes",
        "Click Actions → Edit Code",
        "Click theme.liquid",
        "Find </body>",
        "Paste code RIGHT BEFORE </body>",
        "Click Save"
      ]
    },
    {
      name: "Squarespace",
      icon: "⬛",
      steps: [
        "Go to Settings → Advanced → Code Injection",
        "Paste code in Footer section",
        "Click Save"
      ]
    },
    {
      name: "Wix",
      icon: "🟨",
      steps: [
        "Go to Settings → Custom Code",
        "Click Add Custom Code",
        "Paste the code",
        "Select Body - end",
        "Click Apply"
      ]
    },
    {
      name: "HTML Website",
      icon: "🟧",
      steps: [
        "Open your website file (index.html)",
        "Find </body>",
        "Paste code RIGHT BEFORE </body>",
        "Save the file"
      ]
    },
    {
      name: "Google Sites",
      icon: "🔵",
      steps: [
        "Go to Insert → Embed → Embed Code",
        "Paste the code",
        "Click Insert"
      ]
    },
    {
      name: "Webflow",
      icon: "🟣",
      steps: [
        "Go to Project Settings → Custom Code",
        "Paste code in Footer Code",
        "Click Save Changes"
      ]
    },
    {
      name: "Weebly",
      icon: "🟤",
      steps: [
        "Go to Settings → SEO",
        "Paste code in Footer Code",
        "Click Save"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Where to Add the Code
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Step-by-step instructions for every major website platform
          </p>
          
          {/* Code Box */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>The Code to Add</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {code}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platforms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {platforms.map((platform, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">{platform.icon}</span>
                  {platform.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {platform.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Rule */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">🎯 The Key Rule</h2>
            <p className="text-lg text-gray-700 mb-2">
              <strong>Always paste the code RIGHT BEFORE the closing &lt;/body&gt; tag</strong>
            </p>
            <p className="text-gray-600">
              This ensures the AI chat loads after your website content.
            </p>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="bg-gray-50">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              Can't find your platform or need assistance with installation?
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}