import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedChatMessage } from "@/components/EnhancedChatMessage";
import { EnhancedChatInput } from "@/components/EnhancedChatInput";
import { RepairTemplates } from "@/components/RepairTemplates";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Home, Wrench, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo-minimal.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Connect to actual backend API
const sendTextToBackend = async (message: string): Promise<string> => {
  const { sendChat } = await import("@/lib/api");
  return await sendChat(message);
};

const sendImageToBackend = async (file: File): Promise<string> => {
  const { analyzeImage } = await import("@/lib/api");
  return await analyzeImage(file);
};

const sendVideoToBackend = async (file: File): Promise<string> => {
  const { analyzeVideo } = await import("@/lib/api");
  return await analyzeVideo(file);
};

const sendAudioToBackend = async (file: File): Promise<string> => {
  // For now, treat audio files as attachments
  return `Audio file "${file.name}" received. I'll analyze it for any repair-related sounds or diagnostics.`;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      const response = await sendTextToBackend(message);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    addMessage("user", `📷 Uploaded image: ${file.name}`);
    setIsTyping(true);

    try {
      const response = await sendImageToBackend(file);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 1200);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    addMessage("user", `🎥 Uploaded video: ${file.name}`);
    setIsTyping(true);

    try {
      const response = await sendVideoToBackend(file);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze video. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleAudioUpload = async (file: File) => {
    addMessage("user", `🎵 Uploaded audio: ${file.name}`);
    setIsTyping(true);

    try {
      const response = await sendAudioToBackend(file);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    handleSendMessage(template);
  };

  const startNewConversation = () => {
    setMessages([]);
    setShowTemplates(true);
    toast({
      title: "New conversation started",
      description: "Ready to help with your repair!",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <img src={logo} alt="Fix-ISH" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Fix-ISH AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Your intelligent repair assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="hidden sm:flex"
            >
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              title="Home"
            >
              <Home className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
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
              className="lg:hidden absolute inset-y-0 left-0 w-64 bg-card border-r border-border z-40 pt-16"
            >
              <div className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={startNewConversation}
                >
                  + New Repair Chat
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
            className="flex-1 overflow-y-auto"
          >
            {showTemplates && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <RepairTemplates onSelectTemplate={handleTemplateSelect} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full px-4 py-8">
                {messages.map((message, index) => (
                  <EnhancedChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
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
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
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
  );
}
