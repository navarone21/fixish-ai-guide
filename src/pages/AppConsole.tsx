import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Upload,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Volume2,
  ArrowLeft,
  Layers,
  MessageSquare,
  Zap,
  Target,
  Eye,
  Activity,
  Sparkles,
  Shield,
  TrendingUp,
  X,
  ChevronRight,
  Bot,
  User,
  PanelLeftClose,
  PanelRightClose,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: { type: string; url: string; name?: string };
  steps?: string[];
  tools?: string[];
  warnings?: string[];
  overlays?: any[];
  emotion?: { label: string; confidence: number };
  agents?: string[];
}

interface ToolWithConfidence {
  name: string;
  confidence: number;
}

export default function AppConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  // Panel visibility
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  
  // Backend status
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Check backend health
  useEffect(() => {
    checkHealth();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const checkHealth = async () => {
    setBackendStatus("checking");
    try {
      await FixishAPI.getHealth();
      setBackendStatus("online");
    } catch {
      setBackendStatus("offline");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ type, url, file });
    e.target.value = "";
  };

  // Send message to AGI
  const handleSendMessage = async () => {
    if (!input.trim() && !mediaPreview) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "[Media Uploaded]",
      timestamp: new Date(),
      media: mediaPreview ? { type: mediaPreview.type, url: mediaPreview.url, name: mediaPreview.file.name } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    const currentMedia = mediaPreview;
    setMediaPreview(null);
    setIsLoading(true);

    try {
      let imageBase64: string | undefined;
      let audioBase64: string | undefined;
      
      if (currentMedia) {
        const base64 = await fileToBase64(currentMedia.file);
        if (currentMedia.type.includes("image")) {
          imageBase64 = base64;
        } else if (currentMedia.type.includes("audio")) {
          audioBase64 = base64;
        }
      }

      const result = await FixishAPI.process({
        prompt: currentInput || "Analyze this content",
        image: imageBase64,
        audio: audioBase64,
        context: { messages: messages.slice(-5) }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.instructions || "Analysis complete.",
        timestamp: new Date(),
        steps: result.steps,
        tools: result.predicted_tools,
        warnings: result.warnings,
        overlays: result.overlays,
        emotion: result.emotion,
        agents: result.agent_messages
      };

      setMessages(prev => [...prev, assistantMessage]);
      store.setProcessResult(result);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Direct upload handlers
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    store.setUploadedImage(URL.createObjectURL(file));
    store.setUploadingImage(true);
    
    try {
      const result = await FixishAPI.uploadImage(file);
      store.setImageResult(result);
      toast({ title: "Image Analyzed" });
    } catch (err: any) {
      store.setError(err.message);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      store.setUploadingImage(false);
    }
  }, [toast, store]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    store.setUploadingImage(true);
    
    try {
      const result = await FixishAPI.uploadVideo(file);
      store.setImageResult(result as any);
      toast({ title: "Video Analyzed" });
    } catch (err: any) {
      store.setError(err.message);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      store.setUploadingImage(false);
    }
  }, [toast, store]);

  const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    store.setUploadedAudio(URL.createObjectURL(file));
    store.setUploadingAudio(true);
    
    try {
      const result = await FixishAPI.uploadAudio(file);
      store.setAudioResult(result);
      toast({ title: "Audio Analyzed" });
    } catch (err: any) {
      store.setError(err.message);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      store.setUploadingAudio(false);
    }
  }, [toast, store]);

  const handlePredictTools = useCallback(async () => {
    store.setPredictingTools(true);
    try {
      const result = await FixishAPI.predictTools({ context: store.processResult });
      store.setToolResult(result);
      toast({ title: "Tools Predicted" });
    } catch (err: any) {
      store.setError(err.message);
    } finally {
      store.setPredictingTools(false);
    }
  }, [store, toast]);

  const handlePredictFuture = useCallback(async () => {
    store.setPredictingFuture(true);
    try {
      const result = await FixishAPI.getFuture({ context: store.processResult });
      store.setFutureResult(result);
      toast({ title: "Future Memory Retrieved" });
    } catch (err: any) {
      store.setError(err.message);
    } finally {
      store.setPredictingFuture(false);
    }
  }, [store, toast]);

  const parseTools = (tools: any): ToolWithConfidence[] => {
    if (!tools) return [];
    if (Array.isArray(tools)) {
      return tools.map((t: any) => {
        if (typeof t === 'string') return { name: t, confidence: 85 + Math.random() * 15 };
        return { name: t.name || t.tool || String(t), confidence: t.confidence || 85 + Math.random() * 15 };
      });
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Fix-ISH AGI</h1>
                <p className="text-xs text-muted-foreground">Unified Intelligence Console</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="hidden md:flex"
            >
              <PanelLeftClose className={`h-4 w-4 transition-transform ${!showLeftPanel ? 'rotate-180' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="hidden md:flex"
            >
              <PanelRightClose className={`h-4 w-4 transition-transform ${!showRightPanel ? 'rotate-180' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={checkHealth}>
              <RefreshCw className={`h-4 w-4 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
            </Button>
            <Badge 
              variant={backendStatus === "online" ? "default" : "destructive"}
              className={backendStatus === "online" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${backendStatus === "online" ? "bg-emerald-500" : "bg-red-500"} animate-pulse`} />
              {backendStatus === "online" ? "Connected" : backendStatus === "checking" ? "..." : "Offline"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR - Media Panel */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border bg-card/50 overflow-hidden flex-shrink-0 hidden md:block"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Media Analysis
                  </h2>

                  {/* Image Upload */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        {store.uploadedImage ? (
                          <img src={store.uploadedImage} alt="Uploaded" className="max-h-24 mx-auto rounded" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-muted-foreground py-2">
                            <Upload className="h-6 w-6" />
                            <span className="text-xs">Drop or click</span>
                          </div>
                        )}
                      </div>
                      {store.isUploadingImage && (
                        <div className="flex items-center justify-center gap-2 text-primary text-xs">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing...
                        </div>
                      )}
                      {store.imageResult?.analysis && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                          {store.imageResult.analysis}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Video Upload */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        Video
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full"
                        disabled={store.isUploadingImage}
                      >
                        {store.isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                        Upload Video
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Audio Upload */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-primary" />
                        Audio / Emotion
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioUpload} className="hidden" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full"
                        disabled={store.isUploadingAudio}
                      >
                        {store.isUploadingAudio ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                        Upload Audio
                      </Button>
                      {store.audioResult?.emotion && (
                        <div className="bg-muted/50 rounded p-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Emotion</span>
                            <Badge variant="secondary" className="text-xs">{store.audioResult.emotion.label}</Badge>
                          </div>
                          <Progress value={store.audioResult.emotion.confidence * 100} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="pt-2 space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </h2>
                    <Button 
                      onClick={handlePredictTools} 
                      disabled={store.isPredictingTools || backendStatus !== "online"}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {store.isPredictingTools ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wrench className="h-4 w-4 mr-2 text-primary" />}
                      Predict Tools
                    </Button>
                    <Button 
                      onClick={handlePredictFuture} 
                      disabled={store.isPredictingFuture || backendStatus !== "online"}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {store.isPredictingFuture ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2 text-primary" />}
                      Future Memory
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CENTER - Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Fix-ISH AGI Console</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a prompt, upload media, or use the sidebar tools to start analyzing.
                  </p>
                </motion.div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 border border-border'
                  }`}>
                    {msg.media && (
                      <div className="mb-3">
                        {msg.media.type.includes('image') && (
                          <img src={msg.media.url} alt="" className="max-h-48 rounded-lg" />
                        )}
                        {msg.media.type.includes('video') && (
                          <video src={msg.media.url} controls className="max-h-48 rounded-lg" />
                        )}
                        {msg.media.type.includes('audio') && (
                          <audio src={msg.media.url} controls className="w-full" />
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Steps */}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Layers className="h-3 w-3" />
                          Steps
                        </div>
                        {msg.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Warnings */}
                    {msg.warnings && msg.warnings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        {msg.warnings.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-amber-500">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tools */}
                    {msg.tools && msg.tools.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                          <Wrench className="h-3 w-3" />
                          Recommended Tools
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.tools.map((tool, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emotion */}
                    {msg.emotion && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Detected Emotion</span>
                          <Badge variant="outline">{msg.emotion.label} ({Math.round(msg.emotion.confidence * 100)}%)</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 p-4">
            <div className="max-w-3xl mx-auto">
              {/* Media Preview */}
              {mediaPreview && (
                <div className="mb-3 relative inline-block">
                  {mediaPreview.type.includes('image') && (
                    <img src={mediaPreview.url} alt="" className="h-20 rounded-lg" />
                  )}
                  {mediaPreview.type.includes('video') && (
                    <video src={mediaPreview.url} className="h-20 rounded-lg" />
                  )}
                  {mediaPreview.type.includes('audio') && (
                    <div className="h-20 w-32 bg-muted rounded-lg flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => setMediaPreview(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <div className="flex gap-1">
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                  <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                  <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} className="hidden" />
                  <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} className="text-muted-foreground hover:text-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()} className="text-muted-foreground hover:text-foreground">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => audioInputRef.current?.click()} className="text-muted-foreground hover:text-foreground">
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe what you need help with..."
                  className="flex-1 min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || backendStatus !== "online" || (!input.trim() && !mediaPreview)}
                  size="icon"
                  className="h-11 w-11"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Intelligence Panel */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card/50 overflow-hidden flex-shrink-0 hidden lg:block"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    System Intelligence
                  </h2>

                  {/* Tool Predictions */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        Tool Predictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {store.toolResult?.tools ? (
                        <div className="space-y-2">
                          {parseTools(store.toolResult.tools).map((tool, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{tool.name}</span>
                                <span className="text-muted-foreground">{Math.round(tool.confidence)}%</span>
                              </div>
                              <Progress value={tool.confidence} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Run "Predict Tools" to see recommendations
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Future Memory */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Future Memory
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {store.futureResult ? (
                        <div className="space-y-2">
                          {store.futureResult.next_steps?.map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <ChevronRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                          {store.futureResult.continuity && (
                            <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
                              {store.futureResult.continuity}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Run "Future Memory" to see predictions
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Latest Process Result */}
                  {store.processResult && (
                    <>
                      {/* Emotion */}
                      {store.processResult.emotion && (
                        <Card className="border-border/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Emotion Detection
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">{store.processResult.emotion.label}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(store.processResult.emotion.confidence * 100)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Agent Messages */}
                      {store.processResult.agent_messages && store.processResult.agent_messages.length > 0 && (
                        <Card className="border-border/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Multi-Agent
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {store.processResult.agent_messages.map((msg, i) => (
                                <p key={i} className="text-xs bg-muted/50 rounded p-2">{msg}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Timeline */}
                      {store.processResult.timeline && (
                        <Card className="border-border/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {store.processResult.timeline.past && store.processResult.timeline.past.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground">Past:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {store.processResult.timeline.past.map((item: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{typeof item === 'string' ? item : JSON.stringify(item)}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {store.processResult.timeline.future && store.processResult.timeline.future.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground">Future:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {store.processResult.timeline.future.map((item: any, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{typeof item === 'string' ? item : JSON.stringify(item)}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}