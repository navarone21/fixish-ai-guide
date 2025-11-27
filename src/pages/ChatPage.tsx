import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedChatMessage } from "@/components/EnhancedChatMessage";
import { EnhancedChatInput } from "@/components/EnhancedChatInput";
import { RepairTemplates } from "@/components/RepairTemplates";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { OverlayCanvas } from "@/components/OverlayCanvas";
import { LiveVoice } from "@/components/LiveVoice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Home, Wrench, Menu, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo-minimal.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  results?: {
    type: 'detection' | 'analysis' | 'steps' | 'tools' | 'safety' | 'flow' | 'diagnose';
    data: any;
  };
  overlayData?: {
    baseImage: string;
    overlays: any[];
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (role: "user" | "assistant", content: string, results?: any) => {
    const newMessage: Message = {
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      results,
    };
    setMessages((prev) => [...prev, newMessage]);
    if (role === "user") {
      setShowTemplates(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    addMessage("user", message);
    setIsTyping(true);

    try {
      const { sendChat } = await import("@/lib/api");
      const response = await sendChat(message);
      
      setTimeout(() => {
        addMessage("assistant", response.reply);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not reach backend. Please check if the API is running.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    addMessage("user", `📷 Analyzing image: ${file.name}`);
    setIsTyping(true);
    setUploadProgress(10);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;
      
      try {
        // Run full Fix-ISH flow for comprehensive analysis
        const { runFixishFlow } = await import("@/lib/api");
        setUploadProgress(50);
        
        const flowData = await runFixishFlow(file);
        setUploadProgress(90);
        
        setTimeout(() => {
          const newMessage: Message = {
            role: "assistant",
            content: "I've completed a comprehensive analysis of your image. Here's what I found:",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            results: { type: 'flow', data: flowData },
            overlayData: flowData.overlays ? {
              baseImage: base64Image,
              overlays: flowData.overlays
            } : undefined
          };
          setMessages((prev) => [...prev, newMessage]);
          setIsTyping(false);
          setUploadProgress(0);
        }, 800);
      } catch (error) {
        // Fallback to basic image analysis
        try {
          const { analyzeImage } = await import("@/lib/api");
          const response = await analyzeImage(file);
          
          setTimeout(() => {
            addMessage("assistant", response.analysis);
            setIsTyping(false);
            setUploadProgress(0);
          }, 800);
        } catch (fallbackError) {
          toast({
            title: "Analysis Failed",
            description: "Could not analyze the image. Please try again.",
            variant: "destructive",
          });
          setIsTyping(false);
          setUploadProgress(0);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (file: File) => {
    addMessage("user", `🎥 Analyzing video: ${file.name}`);
    setIsTyping(true);
    setUploadProgress(10);

    try {
      const { getVideoSteps } = await import("@/lib/api");
      setUploadProgress(40);
      
      const videoData = await getVideoSteps(file);
      setUploadProgress(90);
      
      setTimeout(() => {
        addMessage(
          "assistant", 
          "I've analyzed your video. Here are the recommended repair steps:",
          { type: 'steps', data: videoData }
        );
        setIsTyping(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      // Fallback to basic video analysis
      try {
        const { analyzeVideo } = await import("@/lib/api");
        const response = await analyzeVideo(file);
        
        setTimeout(() => {
          addMessage("assistant", response.analysis);
          setIsTyping(false);
          setUploadProgress(0);
        }, 1000);
      } catch (fallbackError) {
        toast({
          title: "Video Analysis Failed",
          description: "Could not analyze the video. Please try again.",
          variant: "destructive",
        });
        setIsTyping(false);
        setUploadProgress(0);
      }
    }
  };

  const handleAudioUpload = async (file: File) => {
    addMessage("user", `🎵 Processing audio: ${file.name}`);
    setIsTyping(true);

    setTimeout(() => {
      addMessage(
        "assistant", 
        `Audio file "${file.name}" received. I'll analyze any sounds that might indicate mechanical issues or help with diagnostics.`
      );
      setIsTyping(false);
    }, 800);
  };

  const handleTemplateSelect = (template: string) => {
    handleSendMessage(template);
  };

  const startNewConversation = () => {
    setMessages([]);
    setShowTemplates(true);
    setUploadProgress(0);
    toast({
      title: "New conversation started",
      description: "Ready to help with your next repair!",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-primary/10"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <img src={logo} alt="Fix-ISH" className="h-9 w-auto" />
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Fix-ISH AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Intelligent Repair Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startNewConversation}
              className="hidden sm:flex gap-2 hover:bg-primary/10"
            >
              <Zap className="w-4 h-4" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              title="Home"
              className="hover:bg-primary/10"
            >
              <Home className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Progress Bar */}
        {uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-1 bg-primary/20"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden absolute inset-y-0 left-0 w-64 bg-card border-r border-border z-40 pt-16 shadow-lg"
            >
              <div className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10"
                  onClick={startNewConversation}
                >
                  <Zap className="w-4 h-4" />
                  New Repair Chat
                </Button>
                <div className="text-xs text-muted-foreground pt-4 px-2">
                  Previous conversations will appear here
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-secondary/5"
          >
            {showTemplates && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center p-4">
                <RepairTemplates onSelectTemplate={handleTemplateSelect} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full px-4 py-8">
                {messages.map((message, index) => (
                  <div key={index} className="mb-6">
                    <EnhancedChatMessage
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                    
                    {/* Overlay Canvas */}
                    {message.overlayData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 ml-12"
                      >
                        <OverlayCanvas 
                          baseImage={message.overlayData.baseImage}
                          overlays={message.overlayData.overlays}
                        />
                      </motion.div>
                    )}
                    
                    {/* Results Display */}
                    {message.results && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 ml-12"
                      >
                        <ResultsDisplay 
                          type={message.results.type} 
                          data={message.results.data}
                        />
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mb-6"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-glow">
                      <Wrench className="w-4 h-4 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <LiveVoice 
                onTranscript={(text) => {
                  console.log("User said:", text);
                  handleSendMessage(text);
                }}
                onAIResponse={(narration) => {
                  console.log("AI narration:", narration);
                  addMessage("assistant", narration);
                }}
              />
              <span className="text-xs text-muted-foreground">
                or type your message below
              </span>
            </div>
            <EnhancedChatInput
              onSendMessage={handleSendMessage}
              onImageUpload={handleImageUpload}
              onVideoUpload={handleVideoUpload}
              onAudioUpload={handleAudioUpload}
              disabled={isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
