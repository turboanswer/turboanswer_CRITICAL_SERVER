import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, Bot, User, Plus, MessageSquare, Trash2, 
  Menu, X, Camera, FileText, ChevronDown, Sparkles,
  Code, Calculator, BookOpen, Palette, Crown, Settings, LogOut
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@shared/schema";

const AI_SERVERS = [
  { id: "auto", name: "Auto", icon: Sparkles, desc: "Smart routing", color: "text-blue-400" },
  { id: "math", name: "Math", icon: Calculator, desc: "Calculations & formulas", color: "text-green-400" },
  { id: "code", name: "Code", icon: Code, desc: "Programming help", color: "text-yellow-400" },
  { id: "knowledge", name: "Knowledge", icon: BookOpen, desc: "Facts & research", color: "text-purple-400" },
  { id: "creative", name: "Creative", icon: Palette, desc: "Writing & ideas", color: "text-pink-400" },
];

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedServer, setSelectedServer] = useState("auto");
  const [showServerPicker, setShowServerPicker] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('turbo_user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) { localStorage.removeItem('turbo_user'); }
    }
  }, []);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", { title: "New chat" });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (conversations.length > 1) {
        const remaining = conversations.filter(c => c.id !== currentConversationId);
        setCurrentConversationId(remaining[0]?.id || null);
      } else {
        setCurrentConversationId(null);
        createConversationMutation.mutate();
      }
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentConversationId) throw new Error("No conversation selected");
      const response = await apiRequest("POST", `/api/conversations/${currentConversationId}/messages`, {
        content,
        selectedModel: selectedServer,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", currentConversationId, "messages"] });
      setMessageContent("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!currentConversationId && conversations.length === 0) {
      createConversationMutation.mutate();
    } else if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [messageContent]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || sendMessageMutation.isPending) return;
    setIsTyping(true);
    sendMessageMutation.mutate(messageContent.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    createConversationMutation.mutate();
  };

  const handleLogout = () => {
    localStorage.removeItem('turbo_user');
    setUser(null);
    toast({ title: "Logged Out", description: "You have been logged out" });
  };

  const currentServer = AI_SERVERS.find(s => s.id === selectedServer) || AI_SERVERS[0];

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0]?.trim() || '';
        const code = lines.slice(lang ? 1 : 0).join('\n').trim();
        return (
          <div key={i} className="my-3 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
            {lang && <div className="px-3 py-1 text-xs text-gray-400 bg-gray-800 border-b border-gray-700">{lang}</div>}
            <pre className="p-3 overflow-x-auto text-sm"><code className="text-green-300">{code}</code></pre>
          </div>
        );
      }
      const formatted = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm text-green-300">$1</code>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="flex h-screen bg-[#171717] text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-[#0d0d0d] flex flex-col overflow-hidden`}
        style={{ transition: 'none' }}>
        <div className="p-3 flex flex-col h-full">
          {/* New Chat Button */}
          <Button
            onClick={handleNewChat}
            className="w-full mb-3 bg-[#212121] hover:bg-[#2a2a2a] text-white border border-gray-700 rounded-lg h-10 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  conv.id === currentConversationId 
                    ? 'bg-[#212121] text-white' 
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                }`}
                onClick={() => setCurrentConversationId(conv.id)}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">{conv.title || "New chat"}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversationMutation.mutate(conv.id); }}
                  className="hidden group-hover:block text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-800 pt-3 mt-3 space-y-1">
            <Link href="/pricing">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-yellow-400 hover:bg-[#1a1a1a] cursor-pointer">
                <Crown className="h-4 w-4" />
                <span>Upgrade to Premium</span>
              </div>
            </Link>
            <Link href="/ai-settings">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#1a1a1a] hover:text-white cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </Link>
            {user ? (
              <div
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#1a1a1a] hover:text-red-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </div>
            ) : (
              <Link href="/login">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-400 hover:bg-[#1a1a1a] cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Sign in</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 border-b border-gray-800 flex items-center px-4 bg-[#171717] flex-shrink-0">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white mr-3"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-sm font-medium text-white">Turbo Answer</h1>
            <span className="text-xs text-gray-500">|</span>
            {/* Server Picker */}
            <div className="relative">
              <button
                onClick={() => setShowServerPicker(!showServerPicker)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-[#212121]"
              >
                <currentServer.icon className={`h-3 w-3 ${currentServer.color}`} />
                <span>{currentServer.name}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {showServerPicker && (
                <div className="absolute top-full left-0 mt-1 bg-[#212121] border border-gray-700 rounded-lg shadow-xl z-50 w-56 py-1">
                  {AI_SERVERS.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => { setSelectedServer(server.id); setShowServerPicker(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#2a2a2a] ${
                        server.id === selectedServer ? 'bg-[#2a2a2a]' : ''
                      }`}
                    >
                      <server.icon className={`h-4 w-4 ${server.color}`} />
                      <div>
                        <div className="text-sm text-white">{server.name}</div>
                        <div className="text-xs text-gray-500">{server.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Camera Button */}
          <Button
            onClick={() => setShowCamera(!showCamera)}
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${showCamera ? 'text-blue-400' : 'text-gray-400'} hover:text-white`}
            title="Camera"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Empty State */}
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">How can I help you today?</h2>
                <p className="text-sm text-gray-400 mb-8 text-center max-w-md">
                  I'm Turbo, your self-hosted AI assistant. Ask me anything about math, coding, science, or just chat.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    { text: "Solve a math problem", icon: Calculator },
                    { text: "Write some code", icon: Code },
                    { text: "Explain a concept", icon: BookOpen },
                    { text: "Help me brainstorm", icon: Palette },
                  ].map(({ text, icon: Icon }) => (
                    <button
                      key={text}
                      onClick={() => { setMessageContent(text); }}
                      className="flex items-center gap-2 p-3 bg-[#212121] hover:bg-[#2a2a2a] rounded-xl text-sm text-gray-300 text-left border border-gray-800"
                    >
                      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 mb-6 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-[#303030] text-white rounded-br-md'
                      : 'text-gray-200'
                  }`}>
                    {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#404040] flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Camera Panel */}
        {showCamera && (
          <div className="border-t border-gray-800 bg-[#1a1a1a] p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Camera className="h-4 w-4 text-blue-400" />
                  Camera - Show me what you need help with
                </h3>
                <Button onClick={() => setShowCamera(false)} variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400">
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <CameraView onCapture={(desc: string) => {
                setMessageContent(desc);
                setShowCamera(false);
              }} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-[#171717] p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#212121] rounded-2xl border border-gray-700 focus-within:border-gray-500">
              <Textarea
                ref={textareaRef}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Turbo..."
                className="w-full bg-transparent border-none text-white placeholder-gray-500 resize-none px-4 pt-3 pb-10 min-h-[52px] max-h-[200px] focus:ring-0 focus:outline-none text-sm"
                rows={1}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <Button
                  onClick={() => setShowCamera(!showCamera)}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500 hover:text-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="h-7 w-7 p-0 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:bg-gray-600 disabled:text-gray-400"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Turbo Answer - Self-hosted AI. Fast. Private. Yours.
            </p>
          </div>
        </div>
      </div>

      {/* Click-away for server picker */}
      {showServerPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowServerPicker(false)} />
      )}
    </div>
  );
}

function CameraView({ onCapture }: { onCapture: (description: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCaptured(imageData);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  if (captured) {
    return (
      <div className="space-y-3">
        <img src={captured} alt="Captured" className="w-full max-h-48 object-contain rounded-lg" />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Describe what you need help with..."
            className="flex-1 px-3 py-2 bg-[#212121] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget.value.trim();
                if (input) onCapture(`[Camera Photo] ${input}`);
              }
            }}
          />
          <Button onClick={() => { setCaptured(null); startCamera(); }} variant="outline" size="sm" className="text-xs border-gray-700">
            Retake
          </Button>
        </div>
        <p className="text-xs text-gray-500">Describe what's in the photo and I'll help you solve it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${streaming ? '' : 'hidden'}`} />
        {!streaming && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
          </div>
        )}
      </div>
      {streaming && (
        <div className="flex justify-center">
          <Button onClick={capturePhoto} className="bg-white text-black hover:bg-gray-200 rounded-full h-12 w-12 p-0">
            <div className="w-8 h-8 border-2 border-black rounded-full" />
          </Button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
