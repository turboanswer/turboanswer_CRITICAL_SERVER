import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Mic, Send, FileText, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TurboLogo } from '@/components/TurboLogo';

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('auto');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
  });

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/conversations', currentConversationId, 'messages'],
    enabled: !!currentConversationId,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "New Conversation"
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setCurrentConversationId(newConversation.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentConversationId) throw new Error("No conversation selected");
      const response = await apiRequest("POST", `/api/conversations/${currentConversationId}/messages`, {
        content,
        selectedModel: selectedAIModel
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', currentConversationId, 'messages'] 
      });
      setMessageContent("");
      setIsTyping(false);
      
      // Automatically speak the AI response for conversational models
      if (data.aiMessage && data.aiMessage.content) {
        console.log('🤖 AI Response received, selected model:', selectedAIModel);
        console.log('🤖 Response content:', data.aiMessage.content.substring(0, 100) + '...');
        
        // Auto-speak for conversational and emotional AI models
        if (selectedAIModel === 'conversational' || selectedAIModel === 'emotional') {
          console.log('🗣️ Auto-speaking enabled for', selectedAIModel);
          setTimeout(() => {
            speakResponse(data.aiMessage.content);
          }, 800); // Longer delay to ensure message is fully rendered
        } else {
          console.log('🗣️ Auto-speak disabled for model:', selectedAIModel);
        }
      }
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create initial conversation
  useEffect(() => {
    if (conversations.length === 0) {
      createConversationMutation.mutate();
    } else if (!currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations]);

  const createNewConversation = () => {
    createConversationMutation.mutate();
  };

  const sendMessage = () => {
    if (!messageContent.trim() || isTyping) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(messageContent);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Upload",
        description: "Document analysis feature coming soon!",
      });
    }
  };

  // Speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessageContent(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      console.log('🗣️ Speaking:', text.substring(0, 50) + '...');
      
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        console.log('🗣️ Speech started');
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log('🗣️ Speech ended');
        setIsSpeaking(false);
      };
      utterance.onerror = (error) => {
        console.error('🗣️ Speech error:', error);
        setIsSpeaking(false);
      };
      
      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Natural') || voice.name.includes('Enhanced') || voice.name.includes('Premium'))
      ) || voices.find(voice => voice.lang.includes('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
        console.log('🗣️ Using voice:', englishVoice.name);
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('🗣️ Speech synthesis not supported');
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="shrink-0 bg-black border-b border-gray-800 shadow-lg z-50 sticky top-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <TurboLogo className="w-10 h-10 shrink-0" />
              <h1 className="text-xl font-bold text-white">TurboAnswer</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="auto">🤖 Auto-Select (Smart)</SelectItem>
                <SelectItem value="conversational">💬 Conversational AI</SelectItem>
                <SelectItem value="emotional">❤️ Emotional AI</SelectItem>
                <SelectItem value="claude-sonnet-4">🧠 Claude 4.0 Sonnet</SelectItem>
                <SelectItem value="gpt-4o">⚡ GPT-4o</SelectItem>
                <SelectItem value="claude-3-opus">🎯 Claude 3 Opus</SelectItem>
                <SelectItem value="gpt-4">🔥 GPT-4</SelectItem>
                <SelectItem value="claude-3-sonnet">📝 Claude 3 Sonnet</SelectItem>
                <SelectItem value="gpt-3.5-turbo">🚀 GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gemini-pro">💎 Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
            
            <button
              onClick={createNewConversation}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-8">What can I help with?</h2>
              </div>
            )}
            
            {/* Messages */}
            {messages.length > 0 && (
              <div className="space-y-4 mb-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => speakResponse(message.content)}
                          className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
                        >
                          🗣️ Speak
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-4 border-t border-gray-800">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 bg-gray-800 border border-gray-700 rounded-full px-4 py-3">
              <label className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
                <FileText className="w-5 h-5" />
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                />
              </label>
              
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything"
                className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <Mic className="w-5 h-5" />
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!messageContent.trim() || isTyping}
                className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {isSpeaking && (
              <div className="text-center text-green-400 text-sm mt-2">🗣️ Speaking...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}