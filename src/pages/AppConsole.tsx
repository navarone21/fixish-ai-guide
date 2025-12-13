import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Wrench,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Bot,
  User,
  Eye,
  Shield,
  Cpu,
  Paperclip,
  Camera,
  Sparkles,
  History,
  FolderOpen,
  Zap,
  Circle,
  MoreHorizontal,
  ArrowLeft,
  Brain,
  Activity,
  Radio,
  Waves,
  FileAudio
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: { type: string; url: string; name?: string }[];
  steps?: string[];
  tools?: string[];
  warnings?: string[];
  reasoning?: string;
  futureMemory?: string[];
  overlays?: any[];
  emotion?: string;
  isExpanded?: boolean;
}

// Smooth spring animation
const spring = { type: "spring" as const, stiffness: 300, damping: 30 };
const smoothSpring = { type: "spring" as const, stiffness: 200, damping: 25 };

export default function AppConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  // Layout
  const [showSidebar, setShowSidebar] = useState(true);
  const [showIntelligence, setShowIntelligence] = useState(true);
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaQueue, setMediaQueue] = useState<{ type: string; url: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedInputType, setDetectedInputType] = useState<string | null>(null);
  
  // Backend status with enhanced reactivity
  const [status, setStatus] = useState({ 
    vision: false, 
    tools: false, 
    memory: false, 
    safety: false,
    visionPulse: 0,
    toolsPulse: 0,
    memoryPulse: 0,
    safetyPulse: 0
  });
  const [isOnline, setIsOnline] = useState(false);
  const [systemLoad, setSystemLoad] = useState(0);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [operationTimeline, setOperationTimeline] = useState<{id: string; name: string; time: Date; status: 'active' | 'complete'}[]>([]);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // System heartbeat effect
  useEffect(() => {
    const heartbeat = setInterval(() => {
      setSystemLoad(prev => {
        if (isLoading) return Math.min(prev + 5, 100);
        return Math.max(prev - 2, isOnline ? 15 : 0);
      });
    }, 100);
    return () => clearInterval(heartbeat);
  }, [isLoading, isOnline]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Detect input type from media queue
  useEffect(() => {
    if (mediaQueue.length > 0) {
      const types = mediaQueue.map(m => m.type);
      if (types.includes('image')) setDetectedInputType('Image Detected → Vision Mode');
      else if (types.includes('video')) setDetectedInputType('Video Detected → Frame Analysis');
      else if (types.includes('audio')) setDetectedInputType('Audio Detected → Emotion Analysis');
      else setDetectedInputType('File Detected');
    } else {
      setDetectedInputType(null);
    }
  }, [mediaQueue]);

  const checkHealth = async () => {
    try {
      await FixishAPI.getHealth();
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const triggerStatusPulse = (key: 'vision' | 'tools' | 'memory' | 'safety') => {
    setStatus(prev => ({ ...prev, [`${key}Pulse`]: prev[`${key}Pulse` as keyof typeof prev] as number + 1 }));
  };

  const addTimelineEvent = (name: string, status: 'active' | 'complete' = 'active') => {
    const event = { id: Date.now().toString(), name, time: new Date(), status };
    setOperationTimeline(prev => [event, ...prev].slice(0, 8));
    return event.id;
  };

  const completeTimelineEvent = (id: string) => {
    setOperationTimeline(prev => prev.map(e => e.id === id ? { ...e, status: 'complete' as const } : e));
  };

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.split('/')[0];
      setMediaQueue(prev => [...prev, { type, url, file, name: file.name }]);
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          setMediaQueue(prev => [...prev, { type: 'image', url, file, name: 'Pasted image' }]);
        }
      }
    }
  };

  const removeMedia = (index: number) => {
    setMediaQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && mediaQueue.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "",
      timestamp: new Date(),
      media: mediaQueue.map(m => ({ type: m.type, url: m.url, name: m.name }))
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentMedia = [...mediaQueue];
    setInput("");
    setMediaQueue([]);
    setIsLoading(true);
    
    // Activate all relevant subsystems with pulses
    const hasImage = currentMedia.some(m => m.type === 'image');
    const hasAudio = currentMedia.some(m => m.type === 'audio');
    const hasVideo = currentMedia.some(m => m.type === 'video');
    
    setStatus({ 
      vision: hasImage || hasVideo, 
      tools: true, 
      memory: true, 
      safety: true,
      visionPulse: hasImage || hasVideo ? 1 : 0,
      toolsPulse: 1,
      memoryPulse: 1,
      safetyPulse: 1
    });
    
    // Set active agents
    const agents = ['Orchestrator'];
    if (hasImage) agents.push('Vision Engine');
    if (hasAudio) agents.push('Audio Analyzer');
    if (hasVideo) agents.push('Frame Processor');
    agents.push('Tool Predictor', 'Memory System');
    setActiveAgents(agents);
    
    // Add timeline events
    const processId = addTimelineEvent('Processing request');

    try {
      let imageBase64: string | undefined;
      let audioBase64: string | undefined;
      
      for (const media of currentMedia) {
        const base64 = await fileToBase64(media.file);
        if (media.type === 'image') {
          imageBase64 = base64;
          triggerStatusPulse('vision');
          addTimelineEvent('Vision analysis');
        }
        else if (media.type === 'audio') {
          audioBase64 = base64;
          addTimelineEvent('Audio processing');
        }
      }

      triggerStatusPulse('tools');
      addTimelineEvent('Tool prediction');
      
      const result = await FixishAPI.process({
        prompt: currentInput || "Analyze this content",
        image: imageBase64,
        audio: audioBase64,
        context: { messages: messages.slice(-5) }
      });

      triggerStatusPulse('memory');
      completeTimelineEvent(processId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.instructions || "Analysis complete.",
        timestamp: new Date(),
        steps: result.steps,
        tools: result.predicted_tools,
        warnings: result.warnings,
        reasoning: result.agent_messages?.join(" ") || undefined,
        futureMemory: result.timeline?.future?.map((f: any) => typeof f === 'string' ? f : JSON.stringify(f)),
        overlays: result.overlays,
        emotion: result.emotion,
        isExpanded: false
      };

      setMessages(prev => [...prev, assistantMessage]);
      store.setProcessResult(result);
      
      // Auto-update tool predictions
      if (result.predicted_tools) {
        store.setToolResult({ tools: result.predicted_tools });
      }
      if (result.timeline?.future) {
        store.setFutureResult({ next_steps: result.timeline.future });
      }
    } catch (error: any) {
      toast({ title: "Connection Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setActiveAgents([]);
      setTimeout(() => setStatus(prev => ({ 
        ...prev, 
        vision: false, 
        tools: false, 
        memory: false, 
        safety: false 
      })), 1500);
    }
  };

  const handlePredictTools = async () => {
    store.setPredictingTools(true);
    setStatus(prev => ({ ...prev, tools: true }));
    triggerStatusPulse('tools');
    addTimelineEvent('Tool prediction');
    try {
      const result = await FixishAPI.predictTools({ context: store.processResult });
      store.setToolResult(result);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      store.setPredictingTools(false);
      setTimeout(() => setStatus(prev => ({ ...prev, tools: false })), 1500);
    }
  };

  const handlePredictFuture = async () => {
    store.setPredictingFuture(true);
    setStatus(prev => ({ ...prev, memory: true }));
    triggerStatusPulse('memory');
    addTimelineEvent('Future prediction');
    try {
      const result = await FixishAPI.getFuture({ context: store.processResult });
      store.setFutureResult(result);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      store.setPredictingFuture(false);
      setTimeout(() => setStatus(prev => ({ ...prev, memory: false })), 1500);
    }
  };

  const toggleMessageExpanded = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  // Enhanced Status Indicator with reactive animations
  const StatusIndicator = ({ 
    active, 
    label, 
    icon: Icon, 
    pulseKey 
  }: { 
    active: boolean; 
    label: string; 
    icon: any;
    pulseKey: number;
  }) => (
    <motion.div 
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 ${
        active 
          ? 'bg-primary/20 text-primary' 
          : 'text-muted-foreground/50 hover:text-muted-foreground/80'
      }`}
      animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        key={pulseKey}
        initial={pulseKey > 0 ? { scale: 1.5, opacity: 0.5 } : false}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <Icon className={`h-3.5 w-3.5 ${active ? 'drop-shadow-[0_0_4px_hsl(var(--primary))]' : ''}`} />
        {active && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/40"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
      <span className="text-[11px] font-medium">{label}</span>
    </motion.div>
  );

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Living Background with Heartbeat */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
        {/* Animated grid - Apple Vision Pro style */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Central glow pulse - system heartbeat */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / ${0.03 + systemLoad * 0.001}) 0%, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header with Live Status */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border/30 bg-background/60 backdrop-blur-2xl shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 rounded-xl hover:bg-muted/60">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                boxShadow: isOnline 
                  ? ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 0 8px hsl(var(--primary) / 0.1)', '0 0 0 0 hsl(var(--primary) / 0)']
                  : 'none'
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <Brain className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground">Fix-ISH</span>
          </div>
        </div>
        
        {/* Live Status Indicators */}
        <div className="flex items-center gap-1 bg-muted/30 backdrop-blur-sm rounded-full px-1 py-0.5 border border-border/20">
          <StatusIndicator active={status.vision} label="Vision" icon={Eye} pulseKey={status.visionPulse} />
          <StatusIndicator active={status.tools} label="Tools" icon={Wrench} pulseKey={status.toolsPulse} />
          <StatusIndicator active={status.memory} label="Memory" icon={Cpu} pulseKey={status.memoryPulse} />
          <StatusIndicator active={status.safety} label="Safety" icon={Shield} pulseKey={status.safetyPulse} />
        </div>

        <div className="flex items-center gap-3">
          {/* System load indicator */}
          <div className="flex items-center gap-2">
            <Activity className={`h-3.5 w-3.5 ${systemLoad > 50 ? 'text-primary' : 'text-muted-foreground/40'}`} />
            <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                animate={{ width: `${systemLoad}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          <motion.div
            animate={isOnline ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge 
              variant="outline" 
              className={`text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm ${
                isOnline 
                  ? 'border-primary/40 text-primary bg-primary/5' 
                  : 'border-destructive/40 text-destructive bg-destructive/5'
              }`}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${isOnline ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
              {isOnline ? 'Connected' : 'Offline'}
            </Badge>
          </motion.div>
        </div>
      </header>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-md flex items-center justify-center border-2 border-dashed border-primary/40 rounded-xl m-4"
          >
            <motion.div 
              className="text-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Paperclip className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-primary">Drop files here</p>
              <p className="text-sm text-muted-foreground mt-1">Images, videos, audio, documents</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="border-r border-border/30 bg-background/40 backdrop-blur-2xl flex flex-col overflow-hidden shrink-0"
            >
              <div className="p-4 space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 h-10 text-xs font-normal rounded-xl hover:bg-muted/60">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Recent Sessions
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 h-10 text-xs font-normal rounded-xl hover:bg-muted/60">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  Saved Projects
                </Button>
              </div>
              
              <div className="border-t border-border/30 p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 px-2 mb-3">Quick Actions</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePredictTools}
                  disabled={store.isPredictingTools}
                  className="w-full justify-start gap-2.5 h-10 text-xs font-normal rounded-xl hover:bg-muted/60"
                >
                  {store.isPredictingTools ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <motion.div animate={status.tools ? { rotate: 360 } : {}} transition={{ duration: 1 }}>
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  )}
                  Predict Tools
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePredictFuture}
                  disabled={store.isPredictingFuture}
                  className="w-full justify-start gap-2.5 h-10 text-xs font-normal rounded-xl hover:bg-muted/60"
                >
                  {store.isPredictingFuture ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  Future Memory
                </Button>
              </div>

              <div className="flex-1" />
              
              {/* Live AR Section - Enhanced */}
              <div className="border-t border-border/30 p-4">
                <motion.div 
                  className="relative rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Rotating ring */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-16 h-16 rounded-full border border-dashed border-primary/30" />
                  </motion.div>
                  
                  <div className="relative flex items-center gap-3">
                    <motion.div
                      className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"
                      animate={{ 
                        boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.3)', '0 0 20px 5px hsl(var(--primary) / 0.1)', '0 0 0 0 hsl(var(--primary) / 0.3)']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Camera className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Live AR</p>
                      <p className="text-[10px] text-muted-foreground">Preparing sensors...</p>
                    </div>
                  </div>
                  
                  {/* Scanning line */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Toggle buttons */}
          <div className="absolute top-3 left-3 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-8 w-8 rounded-xl bg-background/60 backdrop-blur-sm border border-border/20 hover:bg-muted/60"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowIntelligence(!showIntelligence)}
              className="h-8 w-8 rounded-xl bg-background/60 backdrop-blur-sm border border-border/20 hover:bg-muted/60"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-8" ref={scrollRef}>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Idle State - Brain Icon with breathing */}
              {messages.length === 0 && !isLoading && (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="relative inline-flex items-center justify-center mb-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Outer rings */}
                    <motion.div
                      className="absolute w-32 h-32 rounded-full border border-primary/10"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-24 h-24 rounded-full border border-primary/20"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                    />
                    
                    {/* Core */}
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-sm text-muted-foreground/60"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Fix-ISH is listening...
                  </motion.p>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={smoothSpring}
                    layout
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <motion.div 
                        className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Bot className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                    
                    <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Media with enhanced previews */}
                      {msg.media && msg.media.length > 0 && (
                        <motion.div 
                          className="flex flex-wrap gap-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {msg.media.map((m, i) => (
                            <motion.div 
                              key={i} 
                              className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 backdrop-blur-sm"
                              whileHover={{ scale: 1.02 }}
                            >
                              {m.type === 'image' && <img src={m.url} alt="" className="max-h-48 object-cover" />}
                              {m.type === 'video' && <video src={m.url} controls className="max-h-48" />}
                              {m.type === 'audio' && (
                                <div className="p-4 flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileAudio className="h-5 w-5 text-primary" />
                                  </div>
                                  <audio src={m.url} controls className="w-48" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      
                      {/* Content bubble with glassmorphism */}
                      {msg.content && (
                        <motion.div 
                          className={`rounded-2xl px-4 py-3 backdrop-blur-sm ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20' 
                              : 'bg-background/80 border border-border/30 rounded-bl-md'
                          }`}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </motion.div>
                      )}

                      {/* Expandable details with rich content */}
                      {msg.role === 'assistant' && (msg.steps || msg.tools || msg.reasoning || msg.warnings || msg.futureMemory || msg.emotion || msg.overlays) && (
                        <div className="space-y-2 w-full">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleMessageExpanded(msg.id)}
                            className="h-8 text-[11px] text-muted-foreground gap-1.5 px-3 rounded-xl hover:bg-muted/60"
                          >
                            <motion.div
                              animate={{ rotate: msg.isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </motion.div>
                            {msg.isExpanded ? 'Hide details' : 'Show reasoning & subsystems'}
                          </Button>

                          <AnimatePresence>
                            {msg.isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={smoothSpring}
                                className="overflow-hidden space-y-3"
                              >
                                {/* Reasoning */}
                                {msg.reasoning && (
                                  <motion.div 
                                    className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.05 }}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Brain className="h-3.5 w-3.5 text-primary" />
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Reasoning</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{msg.reasoning}</p>
                                  </motion.div>
                                )}

                                {/* Steps with progress */}
                                {msg.steps && msg.steps.length > 0 && (
                                  <motion.div 
                                    className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <Zap className="h-3.5 w-3.5 text-primary" />
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Steps</p>
                                    </div>
                                    <div className="space-y-2">
                                      {msg.steps.map((step, i) => (
                                        <motion.div 
                                          key={i} 
                                          className="flex items-start gap-3 text-xs"
                                          initial={{ x: -10, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: 0.1 + i * 0.05 }}
                                        >
                                          <span className="h-5 w-5 rounded-lg bg-primary/10 text-primary text-[10px] flex items-center justify-center shrink-0 font-medium">{i + 1}</span>
                                          <span className="text-muted-foreground pt-0.5">{step}</span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}

                                {/* Tools with animations */}
                                {msg.tools && msg.tools.length > 0 && (
                                  <motion.div 
                                    className="flex flex-wrap gap-2"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <div className="w-full flex items-center gap-2 mb-1">
                                      <Wrench className="h-3.5 w-3.5 text-primary" />
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Tools Used</p>
                                    </div>
                                    {msg.tools.map((tool, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + i * 0.05 }}
                                      >
                                        <Badge variant="secondary" className="text-[10px] font-normal bg-primary/10 text-primary border-primary/20 px-2.5 py-1 rounded-lg">{tool}</Badge>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                )}

                                {/* Warnings */}
                                {msg.warnings && msg.warnings.length > 0 && (
                                  <motion.div 
                                    className="space-y-2"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    {msg.warnings.map((w, i) => (
                                      <motion.div 
                                        key={i} 
                                        className="flex items-center gap-2.5 text-xs text-amber-500 bg-amber-500/10 rounded-xl px-4 py-2.5 border border-amber-500/20"
                                        animate={{ x: [0, 2, 0] }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                      >
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>{w}</span>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                )}

                                {/* Emotion Detection */}
                                {msg.emotion && (
                                  <motion.div 
                                    className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Waves className="h-3.5 w-3.5 text-primary" />
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Audio Emotion</p>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">{msg.emotion}</Badge>
                                  </motion.div>
                                )}

                                {/* Future Memory */}
                                {msg.futureMemory && msg.futureMemory.length > 0 && (
                                  <motion.div 
                                    className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <Clock className="h-3.5 w-3.5 text-primary" />
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Future Memory</p>
                                    </div>
                                    <div className="space-y-2">
                                      {msg.futureMemory.map((f, i) => (
                                        <motion.div 
                                          key={i} 
                                          className="flex items-start gap-2 text-xs text-muted-foreground"
                                          initial={{ x: -10, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: 0.35 + i * 0.05 }}
                                        >
                                          <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                          <span>{f}</span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <motion.div 
                        className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Enhanced Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <motion.div 
                    className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10"
                    animate={{ 
                      boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.3)', '0 0 20px 5px hsl(var(--primary) / 0.1)', '0 0 0 0 hsl(var(--primary) / 0.3)']
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Bot className="h-4 w-4 text-primary" />
                  </motion.div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground bg-background/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="text-sm">Analyzing...</span>
                    </div>
                    
                    {/* Active agents */}
                    {activeAgents.length > 0 && (
                      <motion.div 
                        className="flex flex-wrap gap-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {activeAgents.map((agent, i) => (
                          <motion.div
                            key={agent}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary px-2 py-0.5">
                              <Radio className="h-2 w-2 mr-1 animate-pulse" />
                              {agent}
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Enhanced Unified Input */}
          <div className="p-4 bg-gradient-to-t from-background via-background/80 to-transparent relative z-10">
            <div className="max-w-2xl mx-auto">
              {/* Detected input type indicator */}
              <AnimatePresence>
                {detectedInputType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 text-xs text-primary mb-2 px-2"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{detectedInputType}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Media queue with enhanced previews */}
              <AnimatePresence>
                {mediaQueue.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-wrap gap-2 mb-3"
                  >
                    {mediaQueue.map((media, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative group"
                      >
                        <div className="h-20 w-20 rounded-xl overflow-hidden border border-border/30 bg-muted/40 backdrop-blur-sm">
                          {media.type === 'image' && <img src={media.url} alt="" className="h-full w-full object-cover" />}
                          {media.type === 'video' && (
                            <div className="relative h-full w-full">
                              <video src={media.url} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Video className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                          {media.type === 'audio' && (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-primary/5">
                              <Mic className="h-5 w-5 text-primary mb-1" />
                              {/* Waveform visualization */}
                              <div className="flex items-end gap-0.5 h-4">
                                {[...Array(5)].map((_, j) => (
                                  <motion.div
                                    key={j}
                                    className="w-1 bg-primary/60 rounded-full"
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <motion.button
                          onClick={() => removeMedia(i)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar with glassmorphism */}
              <motion.div 
                className={`flex items-end gap-2 bg-background/60 backdrop-blur-2xl rounded-2xl border p-2.5 transition-all duration-300 ${
                  isDragging ? 'border-primary/60 bg-primary/5' : 'border-border/30 focus-within:border-primary/40'
                }`}
                animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                />
                
                <div className="flex items-center gap-1 shrink-0">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { fileInputRef.current!.accept = 'image/*'; fileInputRef.current?.click(); }}
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { fileInputRef.current!.accept = 'video/*'; fileInputRef.current?.click(); }}
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { fileInputRef.current!.accept = 'audio/*'; fileInputRef.current?.click(); }}
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="Message Fix-ISH..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none text-sm placeholder:text-muted-foreground/40 focus:outline-none min-h-[40px] max-h-32 py-2.5"
                  style={{ height: 'auto', overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
                />

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleSend}
                    disabled={isLoading || !isOnline || (!input.trim() && mediaQueue.length === 0)}
                    size="icon"
                    className="h-9 w-9 rounded-xl shrink-0 shadow-lg shadow-primary/20"
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Right Intelligence Panel */}
        <AnimatePresence>
          {showIntelligence && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="border-l border-border/30 bg-background/40 backdrop-blur-2xl overflow-hidden shrink-0"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 px-1">Intelligence</p>

                  {/* Tool Predictions with animations */}
                  <motion.div 
                    className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20 p-4 space-y-4"
                    whileHover={{ borderColor: 'hsl(var(--primary) / 0.3)' }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={status.tools ? { rotate: 360 } : {}}
                        transition={{ duration: 1 }}
                      >
                        <Wrench className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="text-xs font-medium">Tool Predictions</span>
                      {store.isPredictingTools && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />
                      )}
                    </div>
                    {store.toolResult?.tools && store.toolResult.tools.length > 0 ? (
                      <div className="space-y-3">
                        {(Array.isArray(store.toolResult.tools) ? store.toolResult.tools : []).slice(0, 5).map((tool: any, i: number) => {
                          const name = typeof tool === 'string' ? tool : tool.name || tool.tool;
                          const conf = typeof tool === 'object' && tool.confidence ? tool.confidence : 70 + Math.random() * 30;
                          return (
                            <motion.div 
                              key={i} 
                              className="space-y-1.5"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">{name}</span>
                                <span className="text-foreground font-medium">{Math.round(conf)}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${conf}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Wrench className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-[11px] text-muted-foreground/50">No predictions yet</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Future Memory with timeline */}
                  <motion.div 
                    className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20 p-4 space-y-4"
                    whileHover={{ borderColor: 'hsl(var(--primary) / 0.3)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Future Memory</span>
                      {store.isPredictingFuture && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />
                      )}
                    </div>
                    {store.futureResult?.next_steps && store.futureResult.next_steps.length > 0 ? (
                      <div className="space-y-2 relative">
                        {/* Timeline line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-primary/20" />
                        
                        {store.futureResult.next_steps.slice(0, 5).map((step: any, i: number) => {
                          const stepText = typeof step === 'string' ? step : step.label || JSON.stringify(step);
                          return (
                            <motion.div 
                              key={i} 
                              className="flex items-start gap-3 text-[11px] text-muted-foreground relative"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="h-3.5 w-3.5 rounded-full bg-primary/20 border-2 border-primary flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{stepText}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Clock className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-[11px] text-muted-foreground/50">No predictions yet</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Operation Timeline */}
                  {operationTimeline.length > 0 && (
                    <motion.div 
                      className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20 p-4 space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">Timeline</span>
                      </div>
                      <div className="space-y-2">
                        {operationTimeline.slice(0, 5).map((op, i) => (
                          <motion.div
                            key={op.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-[10px]"
                          >
                            {op.status === 'active' ? (
                              <motion.div
                                className="h-2 w-2 rounded-full bg-primary"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            )}
                            <span className="text-muted-foreground">{op.name}</span>
                            <span className="text-muted-foreground/40 ml-auto">
                              {op.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Active Agents */}
                  {activeAgents.length > 0 && (
                    <motion.div 
                      className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20 p-4 space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-xs font-medium">Active Agents</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeAgents.map((agent, i) => (
                          <motion.div
                            key={agent}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/30 text-primary">
                              {agent}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* System Status with enhanced visuals */}
                  <motion.div 
                    className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20 p-4 space-y-3"
                    whileHover={{ borderColor: 'hsl(var(--primary) / 0.3)' }}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Subsystems</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Vision', icon: Eye, active: status.vision, pulse: status.visionPulse },
                        { label: 'Memory', icon: Cpu, active: status.memory, pulse: status.memoryPulse },
                        { label: 'Tools', icon: Wrench, active: status.tools, pulse: status.toolsPulse },
                        { label: 'Safety', icon: Shield, active: status.safety, pulse: status.safetyPulse },
                      ].map((s, i) => (
                        <motion.div 
                          key={i} 
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] transition-all ${
                            s.active 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'bg-muted/30 text-muted-foreground/50 border border-transparent'
                          }`}
                          animate={s.active ? { scale: [1, 1.02, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            key={s.pulse}
                            initial={s.pulse > 0 ? { scale: 1.5 } : false}
                            animate={{ scale: 1 }}
                          >
                            <s.icon className={`h-3.5 w-3.5 ${s.active ? 'drop-shadow-[0_0_3px_hsl(var(--primary))]' : ''}`} />
                          </motion.div>
                          <span>{s.label}</span>
                          {s.active && (
                            <motion.div
                              className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
