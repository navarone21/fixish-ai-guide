import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, Sun, Moon, Trash2, ArrowLeft, Paperclip, X, Mic, Share2, Copy, RotateCcw, Edit, Trash, Wrench, Settings, BookOpen, Puzzle, Headphones, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AmbientWorkshopGlow } from "@/components/AmbientWorkshopGlow";
import { ChatThemeProvider, useChatTheme } from "@/contexts/ChatThemeContext";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { FeedbackRating } from "@/components/FeedbackRating";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ParsedMessage } from "@/components/ParsedMessage";
import { EnhancedContentRenderer } from "@/components/EnhancedContentRenderer";
import { RepairGuideViewer } from "@/components/RepairGuideViewer";
import { RepairHistoryDrawer } from "@/components/RepairHistoryDrawer";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo-minimal.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: Date;
  archived?: boolean;
}

interface UploadedFile {
  name: string;
  type: string;
  url: string;
  size: number;
}

const ChatContent = () => {
  const { theme, toggleTheme } = useChatTheme();
  const isDarkMode = theme === "dark";
  
  // Load conversations from localStorage
  const loadConversations = (): Conversation[] => {
    const stored = localStorage.getItem("fixish_conversations");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((conv: any) => ({
        ...conv,
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        timestamp: new Date(conv.timestamp),
      }));
    }
    return [];
  };

  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [currentConversationId, setCurrentConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "**Fix-ish AI here.** I'm your cinematic repair technician – show me what's broken, stuck, or puzzling you. Upload a photo, describe the problem, or just ask. I'll help you see the solution clearly and guide you through every step. What are we fixing today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem("fixish_conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Initialize or load current conversation
  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
      setMessages(conversations[0].messages);
    }
  }, []);

  // Update conversation when messages change
  useEffect(() => {
    if (currentConversationId && messages.length > 1) {
      const lastUserMessage = messages
        .filter((m) => m.role === "user")
        .pop();
      const title =
        lastUserMessage?.content.slice(0, 50) || "New Conversation";
      const lastMessage =
        messages[messages.length - 1]?.content.slice(0, 100) || "";

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === currentConversationId);
        if (existing) {
          return prev.map((c) =>
            c.id === currentConversationId
              ? { ...c, title, lastMessage, messages, timestamp: new Date() }
              : c
          );
        } else {
          return [
            ...prev,
            {
              id: currentConversationId,
              title,
              lastMessage,
              messages,
              timestamp: new Date(),
            },
          ];
        }
      });
    }
  }, [messages, currentConversationId]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
    setIsUserScrolling(!isNearBottom);
  };

  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling]);

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

  const handleNewChat = () => {
    const newConvId = `conv_${Date.now()}`;
    setCurrentConversationId(newConvId);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "**Fix-ish AI here.** I'm your cinematic repair technician – show me what's broken, stuck, or puzzling you. Upload a photo, describe the problem, or just ask. I'll help you see the solution clearly and guide you through every step. What are we fixing today?",
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "New chat started",
      description: "Starting a fresh conversation",
    });
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setMessages(conversation.messages);
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      handleNewChat();
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed",
    });
  };

  const handleArchiveConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, archived: !c.archived } : c
      )
    );
  };

  const handleShareConversation = (id: string) => {
    // Already handled in ConversationSidebar
    console.log("Sharing conversation:", id);
  };

  const handleShareMessage = (message: Message) => {
    const shareText = `Fix-ISH AI: ${message.content}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Fix-ISH AI Response",
          text: shareText,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareText);
          toast({
            title: "Copied to clipboard",
            description: "Message copied to clipboard",
          });
        });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Message copied to clipboard",
      });
    }
  };

  const handleCopyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleRegenerateResponse = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];
      if (previousUserMessage.role === "user") {
        // Remove the assistant's response and regenerate
        setMessages((prev) => prev.slice(0, messageIndex));
        setInput(previousUserMessage.content);
        setTimeout(() => handleSend(), 100);
      }
    }
  };

  const handleEditPrompt = (message: Message) => {
    setInput(message.content);
    toast({
      title: "Editing message",
      description: "Message loaded into input field",
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    toast({
      title: "Message deleted",
      description: "Message removed from conversation",
    });
  };

  const handleTermClick = (term: string) => {
    const newMessage = `Can you explain more about "${term}"? What should I know about it when fixing or repairing things?`;
    setInput(newMessage);
    toast({
      title: "Learning more",
      description: `Asking about ${term}`,
    });
  };

  const handleTranscript = (transcript: string) => {
    setInput(transcript);
    toast({
      title: "Voice input received",
      description: "Transcript added to input",
    });
  };

  const voices = [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" },
  ];

  const quickActions = [
    { id: "repair", label: "Repair", icon: Wrench, color: "#00C2B2" },
    { id: "assemble", label: "Assemble", icon: Settings, color: "#00C2B2" },
    { id: "learn", label: "Learn", icon: BookOpen, color: "#00C2B2" },
    { id: "diagnose", label: "Diagnose", icon: Puzzle, color: "#00C2B2" },
  ];

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

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Generate or retrieve userId from localStorage
  const getUserId = () => {
    let userId = localStorage.getItem("fixish_userId");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("fixish_userId", userId);
    }
    return userId;
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    // Initialize conversation if needed
    if (!currentConversationId) {
      const newConvId = `conv_${Date.now()}`;
      setCurrentConversationId(newConvId);
    }

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
      // Convert files to base64 if present
      let fileData = null;
      let analysisMode = selectedMode;
      if (filesToSend.length > 0) {
        const file = filesToSend[0]; // Send first file
        const base64 = await fileToBase64(file);
        fileData = {
          name: file.name,
          type: file.type,
          data: base64,
          size: file.size,
        };
        
        // Auto-detect repair analysis mode for images
        if (file.type.startsWith('image/') && !analysisMode) {
          analysisMode = 'repair_analysis';
        }
      }

      // Prepare JSON payload
      const payload = {
        message: userMessage.content || (fileData?.type.startsWith('image/') ? "Please analyze this image and provide repair guidance" : "Uploaded file"),
        userId: getUserId(),
        ...(fileData && { file: fileData }),
        ...(analysisMode && { mode: analysisMode }),
      };

      // Clear selected mode after sending
      setSelectedMode(null);

      // Call n8n webhook directly
      const response = await fetch("https://navaroneturnerviii.app.n8n.cloud/webhook-test/fixish-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to communicate with backend: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!responseText) {
        throw new Error("n8n workflow returned empty response. Make sure you have a 'Respond to Webhook' node that returns { reply: 'AI response' }");
      }

      const functionData = JSON.parse(responseText);

      // Check if response is streaming
      if (functionData && typeof functionData === 'object' && 'response' in functionData) {
        const responseText = functionData.response || functionData.message || "I'm here to help! Could you provide more details?";
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: responseText, isStreaming: false }
              : msg
          )
        );
      } else if (typeof functionData === 'string') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: functionData, isStreaming: false }
              : msg
          )
        );
      } else {
        throw new Error("Unexpected response format from backend");
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Connection Error",
        description: errorMessage.includes("Failed to fetch") 
          ? "Unable to reach the backend. Check your network connection." 
          : errorMessage,
        variant: "destructive",
      });
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: "I'm having trouble connecting to the backend right now. Please check your connection and try again.",
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
    <div className="flex h-screen w-full overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onArchiveConversation={handleArchiveConversation}
        onShareConversation={handleShareConversation}
        isDarkMode={isDarkMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-h-0 relative" 
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
                <RepairHistoryDrawer userId={getUserId()} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
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
      <main 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative z-10 scroll-smooth"
      >
        <div className="container mx-auto px-4 py-8 max-w-4xl pb-8">
          {/* Chat Container with Glassmorphism */}
          <div className="rounded-3xl p-6 backdrop-blur-xl shadow-2xl min-h-[calc(100vh-250px)]"
               style={{
                 background: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.7)",
                 border: isDarkMode ? "1px solid rgba(0, 194, 178, 0.15)" : "1px solid rgba(0, 194, 178, 0.3)",
                 boxShadow: isDarkMode ? "0 8px 32px 0 rgba(0, 194, 178, 0.1)" : "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
               }}>
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                 {messages.map((message, index) => (
                   <motion.div
                     key={message.id}
                     initial={{ opacity: 0, y: 20, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
                     transition={{ 
                       duration: 0.4, 
                       ease: [0.4, 0, 0.2, 1],
                       delay: index === messages.length - 1 ? 0.1 : 0
                     }}
                     className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}
                   >
                    <div className="relative max-w-[80%]">
                      {/* Context Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute ${message.role === "user" ? "-left-10" : "-right-10"} top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 z-10`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="w-1 h-1 rounded-full" style={{ background: "#00C2B2" }} />
                              <div className="w-1 h-1 rounded-full" style={{ background: "#00C2B2" }} />
                              <div className="w-1 h-1 rounded-full" style={{ background: "#00C2B2" }} />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align={message.role === "user" ? "start" : "end"}
                          style={{
                            background: isDarkMode ? "#232527" : "#FFFFFF",
                            borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
                          }}
                        >
                          <DropdownMenuItem
                            onClick={() => handleCopyMessage(message)}
                            style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy text
                          </DropdownMenuItem>
                          {message.role === "assistant" && !message.isStreaming && (
                            <DropdownMenuItem
                              onClick={() => handleRegenerateResponse(message.id)}
                              style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Regenerate response
                            </DropdownMenuItem>
                          )}
                          {message.role === "user" && (
                            <DropdownMenuItem
                              onClick={() => handleEditPrompt(message)}
                              style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit prompt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message.id)}
                            style={{ color: "#FF6B6B" }}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div
                        className={`rounded-2xl px-5 py-4 transition-all duration-300 ${
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
                        <div className="text-sm md:text-base leading-relaxed">
                          {message.role === "assistant" ? (
                            <>
                              <EnhancedContentRenderer
                                content={message.content}
                                isDarkMode={isDarkMode}
                                onTermClick={handleTermClick}
                              />
                              <RepairGuideViewer 
                                content={message.content}
                                userId={getUserId()}
                              />
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                          {message.isStreaming && (
                            <motion.span 
                              className="inline-block w-2 h-4 ml-1"
                              style={{ background: message.role === "user" ? "#FFFFFF" : "#00C2B2" }}
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </div>
                      )}

                        <p className="text-xs mt-2" style={{ color: "#999999" }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>

                        {/* Feedback Rating for Assistant Messages */}
                        {message.role === "assistant" && !message.isStreaming && (
                          <>
                            <div className="mt-3 pt-3 border-t" style={{ borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.15)" }}>
                              <FeedbackRating
                                messageId={message.id}
                                sessionId={currentConversationId || "default"}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                            
                             {/* Audio Player */}
                             <AudioPlayer 
                               text={message.content} 
                               isDarkMode={isDarkMode}
                               voice={selectedVoice}
                             />
                          </>
                        )}
                      </div>

                      {/* Share Button */}
                      {message.role === "assistant" && !message.isStreaming && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShareMessage(message)}
                          className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          title="Share message"
                        >
                          <Share2 className="w-4 h-4" style={{ color: "#00C2B2" }} />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator with Wrench */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl px-5 py-4 relative"
                       style={{
                         background: isDarkMode ? "#232527" : "rgba(255, 255, 255, 0.9)",
                         border: isDarkMode ? "1px solid rgba(0, 194, 178, 0.3)" : "1px solid rgba(0, 194, 178, 0.2)",
                       }}>
                    <div className="relative flex items-center justify-center w-12 h-12">
                      {/* Pulsing glow background */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "radial-gradient(circle, rgba(0, 194, 178, 0.3) 0%, rgba(0, 194, 178, 0) 70%)",
                          filter: "blur(8px)",
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      
                      {/* Wrench icon */}
                      <motion.div
                        animate={{
                          rotate: [0, -15, 15, -10, 10, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Wrench 
                          className="w-6 h-6 relative z-10"
                          style={{ 
                            color: "#00C2B2",
                            filter: "drop-shadow(0 0 8px rgba(0, 194, 178, 0.6))",
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
               )}
               <div ref={messagesEndRef} className="h-4" />
             </div>
           </div>
         </div>
       </main>

       {/* Scroll to Bottom Button */}
       <AnimatePresence>
         {showScrollButton && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 20 }}
             className="absolute bottom-24 right-8 z-40"
           >
             <Button
               onClick={() => {
                 setIsUserScrolling(false);
                 scrollToBottom();
               }}
               className="rounded-full h-12 w-12 shadow-lg"
               style={{
                 background: "#00C2B2",
                 color: "#FFFFFF",
               }}
               title="Scroll to bottom"
             >
               <motion.div
                 animate={{ y: [0, 4, 0] }}
                 transition={{ duration: 1, repeat: Infinity }}
               >
                 ↓
               </motion.div>
             </Button>
           </motion.div>
         )}
       </AnimatePresence>

      {/* Input Area - Fixed to bottom */}
      <div className="relative z-50 border-t backdrop-blur-xl flex-shrink-0"
           style={{
             background: isDarkMode ? "rgba(35, 37, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
             borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.3)",
           }}>
        {/* Teal glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
             style={{
               background: "linear-gradient(90deg, transparent, rgba(0, 194, 178, 0.5), transparent)",
               boxShadow: "0 0 10px rgba(0, 194, 178, 0.5)",
             }} />
        
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Quick Actions Bar */}
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
              Quick Actions:
            </span>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMode(action.id);
                  toast({
                    title: `${action.label} mode selected`,
                    description: `Next message will use ${action.label} mode`,
                  });
                }}
                className={`h-8 gap-1.5 transition-all duration-300 ${
                  selectedMode === action.id
                    ? "shadow-md"
                    : "hover:bg-primary/10"
                }`}
                style={
                  selectedMode === action.id
                    ? {
                        background: "rgba(0, 194, 178, 0.15)",
                        color: action.color,
                        borderColor: action.color,
                        border: "1px solid",
                      }
                    : {}
                }
              >
                <action.icon className="w-4 h-4" style={{ color: action.color }} />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
            {selectedMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMode(null);
                  toast({
                    title: "Mode cleared",
                    description: "Back to normal mode",
                  });
                }}
                className="h-8"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Voice & Settings Row */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: isDarkMode ? "#999" : "#666" }}>
                Voice input available below
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                  style={{ color: "#00C2B2" }}
                >
                  <Headphones className="w-4 h-4" />
                  <span className="text-xs">{voices.find(v => v.id === selectedVoice)?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                style={{
                  background: isDarkMode ? "#232527" : "#FFFFFF",
                  borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
                }}
              >
                {voices.map((voice) => (
                  <DropdownMenuItem
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      toast({
                        title: "Voice changed",
                        description: `Now using ${voice.name} voice`,
                      });
                    }}
                    style={{ 
                      color: isDarkMode ? "#EAEAEA" : "#1A1C1E",
                      background: selectedVoice === voice.id ? "rgba(0, 194, 178, 0.1)" : "transparent"
                    }}
                  >
                    {selectedVoice === voice.id && "✓ "}
                    {voice.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="hover:bg-primary/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,194,178,0.4)]"
              title="Upload file"
            >
            <Paperclip className="w-5 h-5" style={{ color: "#00C2B2" }} />
            </Button>

            <VoiceRecorder
              onTranscript={handleTranscript}
              isDarkMode={isDarkMode}
            />

            <div className="flex-1 relative">
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
            </div>
            
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
    </div>
  );
};

const Chat = () => {
  return (
    <ChatThemeProvider>
      <ChatContent />
    </ChatThemeProvider>
  );
};

export default Chat;
