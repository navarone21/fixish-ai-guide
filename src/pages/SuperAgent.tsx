import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Image, Video, Mic, Paperclip, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: {
    type: "image" | "video" | "audio" | "file";
    url: string;
    name?: string;
  };
}

export default function SuperAgent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !mediaPreview) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      media: mediaPreview ? {
        type: mediaPreview.type as any,
        url: mediaPreview.url,
        name: mediaPreview.file.name
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setMediaPreview(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      
      if (mediaPreview) {
        formData.append("file", mediaPreview.file);
        formData.append("prompt", input || "Analyze this and provide repair guidance");
      } else {
        formData.append("prompt", input);
      }
      formData.append("mode", "auto");

      const response = await fetch("https://fix-ish-1.onrender.com/ask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Fix-ISH");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || data.message || "I've analyzed your request. Here's what I found...",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Connection Error",
        description: "Could not reach Fix-ISH backend. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaPreview({ type, url, file });
    e.target.value = "";
  };

  const removePreview = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-accent/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-light tracking-tight">Fix-ISH Super Agent</h1>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 grid md:grid-cols-2 gap-0 overflow-hidden">
        {/* Left - Conversation Panel */}
        <div className="border-r border-border flex flex-col bg-background">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-medium mb-2">Ready to Help</h2>
                <p className="text-muted-foreground max-w-md">
                  Send a message, upload an image, or record audio to get started with your repair assistance.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border rounded-bl-sm"
                      }`}
                    >
                      {message.media && (
                        <div className="mb-2">
                          {message.media.type === "image" && (
                            <img src={message.media.url} alt="Uploaded" className="rounded-lg max-w-full h-auto" />
                          )}
                          {message.media.type === "video" && (
                            <video src={message.media.url} controls className="rounded-lg max-w-full" />
                          )}
                          {message.media.type === "audio" && (
                            <audio src={message.media.url} controls className="w-full" />
                          )}
                          {message.media.type === "file" && (
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm">{message.media.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right - Input Panel */}
        <div className="bg-muted/30 flex flex-col p-6">
          <div className="flex-1 flex flex-col justify-end">
            {/* Media Preview */}
            {mediaPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removePreview}
                  className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                >
                  Remove
                </Button>
                {mediaPreview.type === "image" && (
                  <img src={mediaPreview.url} alt="Preview" className="rounded-lg max-h-60 mx-auto border border-border" />
                )}
                {mediaPreview.type === "video" && (
                  <video src={mediaPreview.url} controls className="rounded-lg max-h-60 mx-auto border border-border" />
                )}
                {mediaPreview.type === "audio" && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <audio src={mediaPreview.url} controls className="w-full" />
                  </div>
                )}
                {mediaPreview.type === "file" && (
                  <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                    <Paperclip className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">{mediaPreview.file.name}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Input Area */}
            <div className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your repair issue or ask a question..."
                className="min-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isLoading}
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  >
                    <Image className="w-5 h-5" />
                  </Button>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isLoading}
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  >
                    <Video className="w-5 h-5" />
                  </Button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, "audio")}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isLoading}
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => handleFileChange(e, "file")}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && !mediaPreview) || isLoading}
                  className="shadow-glow"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
