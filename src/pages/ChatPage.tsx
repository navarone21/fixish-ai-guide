import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import OverlayCanvas from "@/components/OverlayCanvas";
import { useToast } from "@/hooks/use-toast";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Fix-ISH AI assistant. Upload an image or video of your repair issue, or describe what you need help with.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
  };

  const handleSendMessage = async (message: string) => {
    addMessage("user", message);
    setIsTyping(true);

    try {
      const response = await sendTextToBackend(message);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 1000);
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
    addMessage("user", `[Uploaded image: ${file.name}]`);
    setIsTyping(true);

    try {
      const response = await sendImageToBackend(file);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    addMessage("user", `[Uploaded video: ${file.name}]`);
    setIsTyping(true);

    try {
      const response = await sendVideoToBackend(file);
      setTimeout(() => {
        addMessage("assistant", response);
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-20">
        <div className="bg-card border-b border-border py-6 px-6">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-foreground">Fix-ISH AI Assistant</h1>
            <p className="text-muted-foreground mt-1">Your intelligent repair companion</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="container mx-auto max-w-5xl">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-card text-card-foreground rounded-2xl px-4 py-3 shadow-soft border border-border rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="container mx-auto max-w-5xl">
          <ChatInput
            onSendMessage={handleSendMessage}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            disabled={isTyping}
          />
        </div>
      </div>

      <OverlayCanvas />
    </div>
  );
}
