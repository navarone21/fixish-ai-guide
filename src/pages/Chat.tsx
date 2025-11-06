import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, Sun, Moon, Trash2, ArrowLeft, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-minimal.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
  isStreaming?: boolean;
}

interface UploadedFile {
  name: string;
  type: string;
  url: string;
  size: number;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Fix-ISH, your AI repair assistant. Show me what you're working on or describe what needs fixing, and I'll guide you through it step by step.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 20 * 1024 * 1024; // 20MB limit
      if (!isValid) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive",
        });
      }
      return isValid;
    });
    
    if (uploadedFiles.length + validFiles.length > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 files per message",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi! I'm Fix-ISH, your AI repair assistant. Show me what you're working on or describe what needs fixing, and I'll guide you through it step by step.",
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Chat cleared",
      description: "Starting a fresh conversation",
    });
  };

  const streamResponse = async (response: Response, messageId: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (!reader) return;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            accumulatedText += line + "\n";
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? { ...msg, content: accumulatedText.trim(), isStreaming: true }
                  : msg
              )
            );
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error("Streaming error:", error);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userFiles: UploadedFile[] = uploadedFiles.map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      files: userFiles.length > 0 ? userFiles : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]);
    setIsLoading(true);

    // Create placeholder for streaming response
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const formData = new FormData();
      formData.append("message", userMessage.content);
      formData.append("conversation_id", "session_" + Date.now());
      
      filesToSend.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch("https://fixish-ai.n8n.cloud/webhook/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      // Check if response is streaming
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream") || contentType?.includes("text/plain")) {
        await streamResponse(response, aiMessageId);
      } else {
        const data = await response.json();
        const responseText = data.response || data.message || "I'm here to help! Could you provide more details?";
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: responseText, isStreaming: false }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to reach Fix-ISH AI. Please try again.",
        variant: "destructive",
      });
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 border-b border-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Back */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-accent/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img src={logo} alt="Fix-ISH Logo" className="w-6 h-6" />
            </div>
            
            {/* Center: Title */}
            <h1 className="text-xl font-medium tracking-tight text-center flex-1">
              Fix-ISH AI Assistant
            </h1>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2 min-w-[120px] justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="hover:bg-accent/10"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hover:bg-accent/10"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 backdrop-blur-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-primary/10 border border-primary/20 shadow-md"
                    }`}
                  >
                    {/* File Previews */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : file.type.startsWith("video/") ? (
                              <video
                                src={file.url}
                                className="w-16 h-16 object-cover rounded"
                                controls={false}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted-foreground/20 rounded flex items-center justify-center">
                                <Paperclip className="w-6 h-6" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.content && (
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                        )}
                      </p>
                    )}
                    
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-card/80 border-t border-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* File Previews */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="hover:bg-accent/10"
            >
              <Upload className="w-5 h-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you're fixing or upload a video..."
              className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-background/50 border-border focus:border-primary transition-colors"
              disabled={isLoading}
              maxLength={2000}
              rows={1}
            />
            
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
              size="icon"
              className="h-11 w-11"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Fix-ISH™ by Lavern Williams AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
