import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, Sun, Moon, Trash2, ArrowLeft, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AmbientWorkshopGlow } from "@/components/AmbientWorkshopGlow";
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
    <div className="h-screen flex flex-col relative overflow-hidden transition-colors duration-300" 
         style={{ background: isDarkMode ? "linear-gradient(135deg, #1A1C1E 0%, #2A2C2E 100%)" : "linear-gradient(135deg, hsl(210 17% 98%) 0%, hsl(220 14% 96%) 100%)" }}>
      
      {/* Ambient Background */}
      {isDarkMode && <AmbientWorkshopGlow />}

      {/* Header */}
      <header className="relative z-50 backdrop-blur-xl border-b"
              style={{
                background: isDarkMode ? "rgba(35, 37, 39, 0.6)" : "rgba(255, 255, 255, 0.6)",
                borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.3)",
              }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Back */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-primary/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" style={{ color: "#00C2B2" }} />
              </Button>
              <img src={logo} alt="Fix-ISH Logo" className="w-6 h-6" />
            </div>
            
            {/* Center: Title */}
            <h1 className="text-xl font-medium tracking-tight text-center flex-1" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
              Fix-ISH AI Assistant
            </h1>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2 min-w-[120px] justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="hover:bg-primary/10 transition-all duration-300"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" style={{ color: "#00C2B2" }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hover:bg-primary/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,194,178,0.3)]"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" style={{ color: "#00C2B2" }} /> : <Moon className="w-5 h-5" style={{ color: "#00C2B2" }} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Chat Container with Glassmorphism */}
          <div className="rounded-3xl p-6 backdrop-blur-xl shadow-2xl min-h-[calc(100vh-250px)]"
               style={{
                 background: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.7)",
                 border: isDarkMode ? "1px solid rgba(0, 194, 178, 0.15)" : "1px solid rgba(0, 194, 178, 0.3)",
                 boxShadow: isDarkMode ? "0 8px 32px 0 rgba(0, 194, 178, 0.1)" : "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
               }}>
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 transition-all duration-300 ${
                        message.role === "user"
                          ? "shadow-lg"
                          : "backdrop-blur-sm"
                      }`}
                      style={
                        message.role === "user"
                          ? {
                              background: "#00C2B2",
                              color: "#FFFFFF",
                              boxShadow: "0 4px 20px rgba(0, 194, 178, 0.3)",
                            }
                          : {
                              background: isDarkMode ? "#232527" : "rgba(255, 255, 255, 0.9)",
                              color: isDarkMode ? "#EAEAEA" : "#1A1C1E",
                              border: isDarkMode ? "1px solid rgba(0, 194, 178, 0.3)" : "1px solid rgba(0, 194, 178, 0.2)",
                              boxShadow: isDarkMode ? "0 0 20px rgba(0, 194, 178, 0.1)" : "0 2px 10px rgba(0, 0, 0, 0.05)",
                            }
                      }
                    >
                      {/* File Previews */}
                      {message.files && message.files.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg"
                                 style={{ background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.05)" }}>
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
                                <div className="w-16 h-16 rounded flex items-center justify-center"
                                     style={{ background: "rgba(0, 194, 178, 0.1)" }}>
                                  <Paperclip className="w-6 h-6" style={{ color: "#00C2B2" }} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs" style={{ color: "#999999" }}>{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.content && (
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && (
                            <motion.span 
                              className="inline-block w-2 h-4 ml-1"
                              style={{ background: message.role === "user" ? "#FFFFFF" : "#00C2B2" }}
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </p>
                      )}
                      
                      <p className="text-xs mt-2" style={{ color: "#999999" }}>
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
                  <div className="rounded-2xl px-5 py-4"
                       style={{
                         background: isDarkMode ? "#232527" : "rgba(255, 255, 255, 0.9)",
                         border: isDarkMode ? "1px solid rgba(0, 194, 178, 0.3)" : "1px solid rgba(0, 194, 178, 0.2)",
                       }}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: "#00C2B2" }}
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
        </div>
      </main>

      {/* Input Area */}
      <div className="relative z-50 border-t backdrop-blur-xl"
           style={{
             background: isDarkMode ? "rgba(35, 37, 39, 0.6)" : "rgba(255, 255, 255, 0.6)",
             borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.3)",
           }}>
        {/* Teal glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
             style={{
               background: "linear-gradient(90deg, transparent, rgba(0, 194, 178, 0.5), transparent)",
               boxShadow: "0 0 10px rgba(0, 194, 178, 0.5)",
             }} />
        
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
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                       style={{
                         background: isDarkMode ? "rgba(0, 194, 178, 0.1)" : "rgba(0, 194, 178, 0.05)",
                         borderColor: "rgba(0, 194, 178, 0.3)",
                       }}>
                    <Paperclip className="w-4 h-4" style={{ color: "#00C2B2" }} />
                    <span className="text-sm truncate max-w-[150px]" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
                      {file.name}
                    </span>
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
              className="hover:bg-primary/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,194,178,0.4)]"
            >
              <Upload className="w-5 h-5" style={{ color: "#00C2B2" }} />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you're fixing or upload a video..."
              className="flex-1 min-h-[44px] max-h-[200px] resize-none rounded-xl transition-all duration-300"
              style={{
                background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.8)",
                color: isDarkMode ? "#EAEAEA" : "#1A1C1E",
                borderColor: "rgba(0, 194, 178, 0.3)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00C2B2";
                e.target.style.boxShadow = "0 0 0 3px rgba(0, 194, 178, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 194, 178, 0.3)";
                e.target.style.boxShadow = "none";
              }}
              disabled={isLoading}
              maxLength={2000}
              rows={1}
            />
            
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
              size="icon"
              className="h-11 w-11 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,194,178,0.5)]"
              style={{
                background: "#00C2B2",
                color: "#FFFFFF",
              }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-xs text-center mt-3" style={{ color: "#999999" }}>
            Fix-ISH™ by Lavern Williams AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
