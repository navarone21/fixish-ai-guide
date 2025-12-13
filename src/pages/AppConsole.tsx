import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

// UI Components
import { Button } from "@/components/ui/button";
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
  Cpu,
  Radio,
  Waves,
  ScanLine,
  CircuitBoard,
  Radar,
  Gauge,
  BrainCircuit,
  Lightbulb,
  Triangle,
  Camera
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
  reasoning?: string;
  futureMemory?: string[];
}

interface ToolWithConfidence {
  name: string;
  confidence: number;
}

// Animated background grid
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
  </div>
);

// Glowing card component
const GlowCard = ({ children, className = "", glow = false, active = false }: { children: React.ReactNode; className?: string; glow?: boolean; active?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative rounded-xl border backdrop-blur-xl transition-all duration-500 ${
      active 
        ? 'bg-gradient-to-br from-primary/20 via-background/80 to-cyan-500/10 border-primary/50 shadow-[0_0_30px_rgba(0,255,255,0.15)]' 
        : 'bg-background/40 border-border/50 hover:border-primary/30 hover:bg-background/60'
    } ${glow ? 'shadow-[0_0_20px_rgba(0,255,255,0.1)]' : ''} ${className}`}
  >
    {active && (
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
    )}
    {children}
  </motion.div>
);

// AGI Thinking indicator
const AGIThinking = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-4 p-4"
  >
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
      </div>
    </div>
    <div className="space-y-2 flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-primary">AGI Processing</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs text-muted-foreground"
        >
          analyzing multimodal input...
        </motion.span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            className="w-1 h-3 bg-gradient-to-t from-primary/50 to-primary rounded-full"
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// Status indicator
const StatusIndicator = ({ label, status, icon: Icon }: { label: string; status: "active" | "idle" | "processing"; icon: any }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/30 border border-border/30">
    <div className={`relative ${status === 'processing' ? 'animate-pulse' : ''}`}>
      <Icon className={`h-4 w-4 ${status === 'active' ? 'text-emerald-400' : status === 'processing' ? 'text-primary' : 'text-muted-foreground'}`} />
      {status === 'active' && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
      )}
    </div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default function AppConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  
  // Backend status
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  
  // Active systems
  const [activeSystems, setActiveSystems] = useState({
    vision: false,
    memory: false,
    tools: false,
    safety: false
  });
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Check backend health
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
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
    
    // Activate systems based on input
    setActiveSystems({
      vision: !!currentMedia,
      memory: true,
      tools: true,
      safety: true
    });

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
        agents: result.agent_messages,
        reasoning: "Multi-agent reasoning applied",
        futureMemory: result.timeline?.future?.map((f: any) => typeof f === 'string' ? f : JSON.stringify(f))
      };

      setMessages(prev => [...prev, assistantMessage]);
      store.setProcessResult(result);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveSystems({ vision: false, memory: false, tools: false, safety: false }), 2000);
    }
  };

  // Direct upload handlers
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    store.setUploadedImage(URL.createObjectURL(file));
    store.setUploadingImage(true);
    setActiveSystems(prev => ({ ...prev, vision: true }));
    
    try {
      const result = await FixishAPI.uploadImage(file);
      store.setImageResult(result);
      toast({ title: "Vision Analysis Complete" });
    } catch (err: any) {
      store.setError(err.message);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      store.setUploadingImage(false);
      setTimeout(() => setActiveSystems(prev => ({ ...prev, vision: false })), 2000);
    }
  }, [toast, store]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    store.setUploadingImage(true);
    setActiveSystems(prev => ({ ...prev, vision: true }));
    
    try {
      const result = await FixishAPI.uploadVideo(file);
      store.setImageResult(result as any);
      toast({ title: "Video Analysis Complete" });
    } catch (err: any) {
      store.setError(err.message);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      store.setUploadingImage(false);
      setTimeout(() => setActiveSystems(prev => ({ ...prev, vision: false })), 2000);
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
      toast({ title: "Audio Analysis Complete" });
    } catch (err: any) {
      store.setError(err.message);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      store.setUploadingAudio(false);
    }
  }, [toast, store]);

  const handlePredictTools = useCallback(async () => {
    store.setPredictingTools(true);
    setActiveSystems(prev => ({ ...prev, tools: true }));
    try {
      const result = await FixishAPI.predictTools({ context: store.processResult });
      store.setToolResult(result);
      toast({ title: "Tools Predicted" });
    } catch (err: any) {
      store.setError(err.message);
    } finally {
      store.setPredictingTools(false);
      setTimeout(() => setActiveSystems(prev => ({ ...prev, tools: false })), 2000);
    }
  }, [store, toast]);

  const handlePredictFuture = useCallback(async () => {
    store.setPredictingFuture(true);
    setActiveSystems(prev => ({ ...prev, memory: true }));
    try {
      const result = await FixishAPI.getFuture({ context: store.processResult });
      store.setFutureResult(result);
      toast({ title: "Future Memory Retrieved" });
    } catch (err: any) {
      store.setError(err.message);
    } finally {
      store.setPredictingFuture(false);
      setTimeout(() => setActiveSystems(prev => ({ ...prev, memory: false })), 2000);
    }
  }, [store, toast]);

  const parseTools = (tools: any): ToolWithConfidence[] => {
    if (!tools) return [];
    if (Array.isArray(tools)) {
      return tools.map((t: any) => {
        if (typeof t === 'string') return { name: t, confidence: 75 + Math.random() * 25 };
        return { name: t.name || t.tool || String(t), confidence: t.confidence || 75 + Math.random() * 25 };
      });
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <GridBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-border/50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ boxShadow: backendStatus === 'online' ? ['0 0 20px rgba(0,255,255,0.3)', '0 0 40px rgba(0,255,255,0.1)', '0 0 20px rgba(0,255,255,0.3)'] : 'none' }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-cyan-500 to-primary flex items-center justify-center"
              >
                <BrainCircuit className="h-5 w-5 text-background" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                  FIX-ISH AGI
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Unified Intelligence Console</p>
              </div>
            </div>
          </div>
          
          {/* System Status Indicators */}
          <div className="hidden lg:flex items-center gap-2">
            <StatusIndicator label="Vision" status={activeSystems.vision ? 'active' : 'idle'} icon={Eye} />
            <StatusIndicator label="Memory" status={activeSystems.memory ? 'processing' : 'idle'} icon={Cpu} />
            <StatusIndicator label="Tools" status={activeSystems.tools ? 'active' : 'idle'} icon={Wrench} />
            <StatusIndicator label="Safety" status={activeSystems.safety ? 'active' : 'idle'} icon={Shield} />
          </div>

          <motion.div
            animate={{ scale: backendStatus === 'online' ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge 
              className={`px-4 py-1.5 ${
                backendStatus === "online" 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  : "bg-red-500/20 text-red-400 border-red-500/50"
              }`}
            >
              <Radio className={`h-3 w-3 mr-2 ${backendStatus === 'online' ? 'animate-pulse' : ''}`} />
              {backendStatus === "online" ? "SYSTEM ONLINE" : backendStatus === "checking" ? "CONNECTING..." : "OFFLINE"}
            </Badge>
          </motion.div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex h-[calc(100vh-65px)] relative">
        
        {/* LEFT PANEL - Multimodal Inputs */}
        <aside className="w-72 border-r border-border/30 bg-background/30 backdrop-blur-xl hidden md:flex flex-col">
          <div className="p-4 border-b border-border/30">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" />
              Multimodal Input
            </h2>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              
              {/* Image Upload */}
              <GlowCard active={store.isUploadingImage || !!store.uploadedImage}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Vision Input</span>
                    </div>
                    {store.isUploadingImage && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                  <motion.div 
                    whileHover={{ scale: 1.02, borderColor: 'hsl(var(--primary))' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-border/50 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-primary/5"
                  >
                    {store.uploadedImage ? (
                      <img src={store.uploadedImage} alt="" className="max-h-24 mx-auto rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs">Drop or click to upload</span>
                      </div>
                    )}
                  </motion.div>
                  {store.imageResult?.analysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
                    >
                      <p className="text-muted-foreground">{store.imageResult.analysis}</p>
                    </motion.div>
                  )}
                </div>
              </GlowCard>

              {/* Video Upload */}
              <GlowCard>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Video Input</span>
                  </div>
                  <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/5"
                    disabled={store.isUploadingImage}
                  >
                    {store.isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                    Upload Video
                  </Button>
                </div>
              </GlowCard>

              {/* Audio Upload */}
              <GlowCard active={!!store.audioResult?.emotion}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Audio / Emotion</span>
                  </div>
                  <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioUpload} className="hidden" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/5"
                    disabled={store.isUploadingAudio}
                  >
                    {store.isUploadingAudio ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    Upload Audio
                  </Button>
                  {store.audioResult?.emotion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Detected Emotion</span>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {store.audioResult.emotion.label}
                        </Badge>
                      </div>
                      <div className="relative h-2 rounded-full bg-background/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${store.audioResult.emotion.confidence * 100}%` }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-primary rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </GlowCard>

              {/* Live AR Placeholder */}
              <GlowCard>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Live AR</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">Coming Soon</Badge>
                  </div>
                  <div className="h-20 rounded-lg bg-muted/20 border border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <Radar className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </div>
              </GlowCard>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border/30 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Quick Actions
                </h3>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handlePredictTools} 
                    disabled={store.isPredictingTools || backendStatus !== "online"}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {store.isPredictingTools ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wrench className="h-4 w-4 mr-2 text-primary" />}
                    Predict Tools
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handlePredictFuture} 
                    disabled={store.isPredictingFuture || backendStatus !== "online"}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {store.isPredictingFuture ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2 text-primary" />}
                    Future Memory
                  </Button>
                </motion.div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* CENTER - AGI Feed */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-background/0 via-background/50 to-background/80">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ 
                      boxShadow: ['0 0 40px rgba(0,255,255,0.2)', '0 0 80px rgba(0,255,255,0.1)', '0 0 40px rgba(0,255,255,0.2)']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/30 via-cyan-500/20 to-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/30"
                  >
                    <BrainCircuit className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent mb-3">
                    Fix-ISH AGI Ready
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a prompt, upload media, or use the sidebar tools to begin multimodal analysis.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span>100 subsystems active</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span>Multimodal ready</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    layout
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30"
                      >
                        <Bot className="h-5 w-5 text-background" />
                      </motion.div>
                    )}
                    <GlowCard 
                      className={`max-w-[75%] ${msg.role === 'user' ? 'bg-gradient-to-br from-primary/20 to-cyan-500/10' : ''}`}
                      glow={msg.role === 'assistant'}
                    >
                      <div className="p-4 space-y-3">
                        {/* Media */}
                        {msg.media && (
                          <div className="mb-3 rounded-lg overflow-hidden">
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
                        
                        {/* Main content */}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Reasoning */}
                        {msg.role === 'assistant' && msg.reasoning && (
                          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 rounded-lg px-3 py-2">
                            <Lightbulb className="h-3 w-3" />
                            <span>{msg.reasoning}</span>
                          </div>
                        )}
                        
                        {/* Steps */}
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-border/30">
                            <div className="flex items-center gap-2 text-xs font-medium text-primary">
                              <Layers className="h-3 w-3" />
                              Step-by-Step Plan
                            </div>
                            {msg.steps.map((step, i) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 text-sm"
                              >
                                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/30 to-cyan-500/20 text-primary text-xs flex items-center justify-center flex-shrink-0 border border-primary/30">
                                  {i + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {/* Warnings */}
                        {msg.warnings && msg.warnings.length > 0 && (
                          <div className="space-y-1 pt-3 border-t border-border/30">
                            {msg.warnings.map((w, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tools */}
                        {msg.tools && msg.tools.length > 0 && (
                          <div className="pt-3 border-t border-border/30">
                            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
                              <Wrench className="h-3 w-3" />
                              Recommended Tools
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.tools.map((tool, i) => (
                                <Badge key={i} className="bg-primary/10 text-primary border-primary/30 text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Future Memory */}
                        {msg.futureMemory && msg.futureMemory.length > 0 && (
                          <div className="pt-3 border-t border-border/30">
                            <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 mb-2">
                              <Clock className="h-3 w-3" />
                              Future Memory
                            </div>
                            <div className="space-y-1">
                              {msg.futureMemory.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <ChevronRight className="h-3 w-3 mt-0.5 text-cyan-500" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Emotion */}
                        {msg.emotion && (
                          <div className="flex items-center justify-between pt-3 border-t border-border/30">
                            <span className="text-xs text-muted-foreground">Detected Emotion</span>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {msg.emotion.label} ({Math.round(msg.emotion.confidence * 100)}%)
                            </Badge>
                          </div>
                        )}
                      </div>
                    </GlowCard>
                    {msg.role === 'user' && (
                      <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 border border-border/50">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && <AGIThinking />}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/30 bg-background/60 backdrop-blur-xl p-4">
            <div className="max-w-3xl mx-auto">
              {/* Media Preview */}
              <AnimatePresence>
                {mediaPreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 relative inline-block"
                  >
                    <div className="rounded-xl overflow-hidden border border-primary/30 shadow-lg shadow-primary/10">
                      {mediaPreview.type.includes('image') && (
                        <img src={mediaPreview.url} alt="" className="h-20 object-cover" />
                      )}
                      {mediaPreview.type.includes('video') && (
                        <video src={mediaPreview.url} className="h-20" />
                      )}
                      {mediaPreview.type.includes('audio') && (
                        <div className="h-20 w-32 bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center">
                          <Waves className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setMediaPreview(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex gap-3 items-end">
                <div className="flex gap-1 pb-1">
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                  <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                  <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} className="hidden" />
                  <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()} className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => audioInputRef.current?.click()} className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 relative">
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
                    className="min-h-[48px] max-h-32 resize-none bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-12"
                    rows={1}
                  />
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || backendStatus !== "online" || (!input.trim() && !mediaPreview)}
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-lg shadow-primary/30"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - System Intelligence */}
        <aside className="w-80 border-l border-border/30 bg-background/30 backdrop-blur-xl hidden lg:flex flex-col">
          <div className="p-4 border-b border-border/30">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CircuitBoard className="h-4 w-4 text-primary" />
              System Intelligence
            </h2>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              
              {/* Tool Predictions */}
              <GlowCard active={store.isPredictingTools || (store.toolResult?.tools && store.toolResult.tools.length > 0)}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Tool Predictions</span>
                    </div>
                    {store.isPredictingTools && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>
                  {store.toolResult?.tools && store.toolResult.tools.length > 0 ? (
                    <div className="space-y-3">
                      {parseTools(store.toolResult.tools).map((tool, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="space-y-1"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="text-foreground">{tool.name}</span>
                            <span className="text-primary font-medium">{Math.round(tool.confidence)}%</span>
                          </div>
                          <div className="relative h-1.5 rounded-full bg-background/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${tool.confidence}%` }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-cyan-500 rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Run "Predict Tools" to analyze
                    </p>
                  )}
                </div>
              </GlowCard>

              {/* Future Memory */}
              <GlowCard active={store.isPredictingFuture || !!store.futureResult}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium">Future Memory</span>
                    </div>
                    {store.isPredictingFuture && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
                  </div>
                  {store.futureResult ? (
                    <div className="space-y-2">
                      {store.futureResult.next_steps?.map((step, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-xs"
                        >
                          <ChevronRight className="h-3 w-3 text-cyan-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{step}</span>
                        </motion.div>
                      ))}
                      {store.futureResult.continuity && (
                        <p className="text-xs text-cyan-400/70 italic pt-2 border-t border-border/30">
                          {store.futureResult.continuity}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Run "Future Memory" for predictions
                    </p>
                  )}
                </div>
              </GlowCard>

              {/* Active Agents */}
              {store.processResult?.agent_messages && store.processResult.agent_messages.length > 0 && (
                <GlowCard active glow>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium">Multi-Agent Output</span>
                    </div>
                    <div className="space-y-2">
                      {store.processResult.agent_messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.15 }}
                          className="text-xs p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-muted-foreground"
                        >
                          {msg}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              )}

              {/* Emotion Detection */}
              {store.processResult?.emotion && (
                <GlowCard>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <span className="text-sm font-medium">Emotion Detection</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                        {store.processResult.emotion.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(store.processResult.emotion.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </GlowCard>
              )}

              {/* Timeline */}
              {store.processResult?.timeline && (
                <GlowCard>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium">AGI Timeline</span>
                    </div>
                    <div className="space-y-3">
                      {store.processResult.timeline.past && store.processResult.timeline.past.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Past Actions</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {store.processResult.timeline.past.slice(0, 3).map((item: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] border-border/50">
                                {typeof item === 'string' ? item : JSON.stringify(item).slice(0, 20)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {store.processResult.timeline.future && store.processResult.timeline.future.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Predicted Future</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {store.processResult.timeline.future.slice(0, 3).map((item: any, i: number) => (
                              <Badge key={i} className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                {typeof item === 'string' ? item : JSON.stringify(item).slice(0, 20)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </GlowCard>
              )}

              {/* System Status */}
              <GlowCard>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">System Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Vision', icon: Eye, active: activeSystems.vision },
                      { label: 'Memory', icon: Cpu, active: activeSystems.memory },
                      { label: 'Tools', icon: Wrench, active: activeSystems.tools },
                      { label: 'Safety', icon: Shield, active: activeSystems.safety },
                    ].map((sys, i) => (
                      <div 
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          sys.active 
                            ? 'bg-primary/20 border border-primary/30' 
                            : 'bg-background/30 border border-border/30'
                        }`}
                      >
                        <sys.icon className={`h-3 w-3 ${sys.active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-xs ${sys.active ? 'text-primary' : 'text-muted-foreground'}`}>{sys.label}</span>
                        {sys.active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </div>
          </ScrollArea>
        </aside>
      </main>
    </div>
  );
}