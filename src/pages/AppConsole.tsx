import { useState, useRef, useEffect, DragEvent } from "react";
import hummingbirdLogo from "@/assets/hummingbird-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Eye,
  Shield,
  Cpu,
  Camera,
  
  Zap,
  ArrowLeft,
  Plus,
  Monitor,
  FileUp,
  Waves,
  FileText,
  Sparkles,
  Activity,
  Target,
  Layers,
  Radio,
  BarChart3,
  Gauge,
  CircleDot,
  Command,
  ScanLine
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OutputModule {
  id: string;
  type: 'analysis' | 'steps' | 'tools' | 'warning' | 'vision' | 'audio' | 'memory' | 'diagram';
  title: string;
  content: any;
  timestamp: Date;
  status: 'processing' | 'complete' | 'error';
  media?: { type: string; url: string }[];
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

// Subsystem definitions
const subsystems = [
  { id: 'vision', icon: Eye, label: 'Vision', color: 'hsl(180 100% 60%)' },
  { id: 'video', icon: Video, label: 'Video', color: 'hsl(200 100% 60%)' },
  { id: 'audio', icon: Waves, label: 'Audio/Emotion', color: 'hsl(280 100% 60%)' },
  { id: 'documents', icon: FileText, label: 'Documents', color: 'hsl(40 100% 60%)' },
  { id: 'enhance', icon: Sparkles, label: 'Enhance', color: 'hsl(320 100% 60%)' },
  { id: 'memory', icon: Cpu, label: 'Memory', color: 'hsl(140 100% 50%)' },
  { id: 'tools', icon: Wrench, label: 'Tools', color: 'hsl(30 100% 60%)' },
  { id: 'safety', icon: Shield, label: 'Safety', color: 'hsl(0 80% 60%)' },
  { id: 'ar', icon: ScanLine, label: 'Live AR', color: 'hsl(260 100% 65%)' },
];

export default function AppConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  const [activeSubsystem, setActiveSubsystem] = useState<string | null>(null);
  const [hoveredSubsystem, setHoveredSubsystem] = useState<string | null>(null);
  const [outputModules, setOutputModules] = useState<OutputModule[]>([]);
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mediaQueue, setMediaQueue] = useState<{ type: string; url: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [systemStatus, setSystemStatus] = useState({
    vision: { active: false, fps: 0, objects: 0 },
    audio: { active: false, emotion: '', confidence: 0 },
    tools: { active: false, predictions: [] as string[] },
    memory: { active: false, entries: 0 },
    safety: { active: false, level: 'normal' as 'normal' | 'warning' | 'critical' }
  });
  
  const [isOnline, setIsOnline] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [outputModules]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        commandInputRef.current?.focus();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkHealth = async () => {
    try {
      await FixishAPI.getHealth();
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = (files: FileList | null, type?: string) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const fileType = type || file.type.split('/')[0];
      setMediaQueue(prev => [...prev, { type: fileType, url, file, name: file.name }]);
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeMedia = (index: number) => {
    setMediaQueue(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const addOutputModule = (module: Omit<OutputModule, 'id' | 'timestamp'>) => {
    const newModule: OutputModule = {
      ...module,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setOutputModules(prev => [...prev, newModule]);
    return newModule.id;
  };

  const updateOutputModule = (id: string, updates: Partial<OutputModule>) => {
    setOutputModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const executeCommand = async () => {
    if (!command.trim() && mediaQueue.length === 0) return;

    setIsProcessing(true);
    setCommandPaletteOpen(false);
    
    // Add input module
    if (mediaQueue.length > 0) {
      addOutputModule({
        type: 'vision',
        title: 'Input Media',
        content: { files: mediaQueue.map(m => m.name) },
        status: 'complete',
        media: mediaQueue.map(m => ({ type: m.type, url: m.url }))
      });
    }

    // Add processing module
    const processingId = addOutputModule({
      type: 'analysis',
      title: 'Processing Request',
      content: { command: command || 'Analyzing media...' },
      status: 'processing'
    });

    // Activate subsystems
    setSystemStatus(prev => ({
      ...prev,
      vision: { ...prev.vision, active: mediaQueue.some(m => m.type === 'image' || m.type === 'video') },
      audio: { ...prev.audio, active: mediaQueue.some(m => m.type === 'audio') },
      tools: { ...prev.tools, active: true },
      memory: { ...prev.memory, active: true }
    }));

    const currentCommand = command;
    const currentMedia = [...mediaQueue];
    setCommand("");
    setMediaQueue([]);

    try {
      let imageBase64: string | undefined;
      let audioBase64: string | undefined;
      
      for (const media of currentMedia) {
        const base64 = await fileToBase64(media.file);
        if (media.type === 'image') imageBase64 = base64;
        else if (media.type === 'audio') audioBase64 = base64;
      }

      const result = await FixishAPI.process({
        prompt: currentCommand || "Analyze this content",
        image: imageBase64,
        audio: audioBase64,
        context: {}
      });

      // Update processing module
      updateOutputModule(processingId, {
        status: 'complete',
        content: { command: currentCommand, result: 'Analysis complete' }
      });

      // Add result modules
      if (result.instructions) {
        addOutputModule({
          type: 'analysis',
          title: 'AGI Analysis',
          content: { text: result.instructions },
          status: 'complete'
        });
      }

      if (result.steps && result.steps.length > 0) {
        addOutputModule({
          type: 'steps',
          title: 'Execution Steps',
          content: { steps: result.steps },
          status: 'complete'
        });
      }

      if (result.predicted_tools && result.predicted_tools.length > 0) {
        addOutputModule({
          type: 'tools',
          title: 'Tool Predictions',
          content: { tools: result.predicted_tools },
          status: 'complete'
        });
        setSystemStatus(prev => ({
          ...prev,
          tools: { ...prev.tools, predictions: result.predicted_tools || [] }
        }));
        store.setToolResult({ tools: result.predicted_tools });
      }

      if (result.warnings && result.warnings.length > 0) {
        addOutputModule({
          type: 'warning',
          title: 'Safety Warnings',
          content: { warnings: result.warnings },
          status: 'complete'
        });
        setSystemStatus(prev => ({
          ...prev,
          safety: { ...prev.safety, active: true, level: 'warning' }
        }));
      }

      if (result.emotion) {
        setSystemStatus(prev => ({
          ...prev,
          audio: { active: true, emotion: result.emotion?.label || '', confidence: result.emotion?.confidence || 0 }
        }));
      }

      if (result.timeline?.future) {
        addOutputModule({
          type: 'memory',
          title: 'Future Memory',
          content: { predictions: result.timeline.future },
          status: 'complete'
        });
        store.setFutureResult({ next_steps: result.timeline.future });
      }

      store.setProcessResult(result);

    } catch (error: any) {
      updateOutputModule(processingId, {
        status: 'error',
        content: { error: error.message }
      });
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setSystemStatus(prev => ({
          vision: { ...prev.vision, active: false },
          audio: { ...prev.audio, active: false },
          tools: { ...prev.tools, active: false },
          memory: { ...prev.memory, active: false },
          safety: { ...prev.safety, active: false, level: 'normal' }
        }));
      }, 2000);
    }
  };

  // Output Module Renderer
  const OutputModuleCard = ({ module }: { module: OutputModule }) => {
    const getModuleIcon = () => {
      switch (module.type) {
        case 'vision': return Eye;
        case 'steps': return Layers;
        case 'tools': return Wrench;
        case 'warning': return AlertTriangle;
        case 'audio': return Waves;
        case 'memory': return Cpu;
        case 'diagram': return BarChart3;
        default: return Cpu;
      }
    };
    const Icon = getModuleIcon();
    const isWarning = module.type === 'warning';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className={`rounded-xl border backdrop-blur-sm overflow-hidden ${
          isWarning 
            ? 'bg-amber-500/5 border-amber-500/20' 
            : 'bg-card/40 border-border/30'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isWarning ? 'border-amber-500/20 bg-amber-500/5' : 'border-border/20 bg-muted/20'
        }`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-3.5 w-3.5 ${isWarning ? 'text-amber-500' : 'text-primary'}`} />
            <span className="text-xs font-medium">{module.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {module.status === 'processing' && (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            )}
            {module.status === 'complete' && (
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
            {module.status === 'error' && (
              <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
            )}
            <span className="text-[9px] text-muted-foreground">
              {module.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Media */}
          {module.media && module.media.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {module.media.map((m, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border/20 max-w-[200px]">
                  {m.type === 'image' && <img src={m.url} alt="" className="max-h-32 object-cover" />}
                  {m.type === 'video' && <video src={m.url} controls className="max-h-32" />}
                  {m.type === 'audio' && <audio src={m.url} controls className="w-48" />}
                </div>
              ))}
            </div>
          )}

          {/* Text content */}
          {module.content.text && (
            <p className="text-sm text-foreground leading-relaxed">{module.content.text}</p>
          )}

          {/* Command */}
          {module.content.command && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span className="font-mono">{module.content.command}</span>
            </div>
          )}

          {/* Steps */}
          {module.content.steps && (
            <div className="space-y-2">
              {module.content.steps.map((step: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="h-5 w-5 rounded bg-primary/10 text-primary text-[10px] flex items-center justify-center shrink-0 font-medium">
                    {i + 1}
                  </div>
                  <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tools */}
          {module.content.tools && (
            <div className="flex flex-wrap gap-1.5">
              {module.content.tools.map((tool: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{tool}</Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {module.content.warnings && (
            <div className="space-y-2">
              {module.content.warnings.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Future predictions */}
          {module.content.predictions && (
            <div className="space-y-1.5">
              {module.content.predictions.slice(0, 5).map((p: any, i: number) => {
                const text = typeof p === 'string' ? p : p.label || JSON.stringify(p);
                return (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error */}
          {module.content.error && (
            <p className="text-sm text-destructive">{module.content.error}</p>
          )}

          {/* Files */}
          {module.content.files && (
            <div className="flex flex-wrap gap-1.5">
              {module.content.files.map((f: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <div 
        className="h-screen flex flex-col overflow-hidden bg-[hsl(220,20%,8%)] text-foreground"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Deep space grid background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
              animate={{ 
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        {/* Header */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border/10 bg-background/20 backdrop-blur-xl shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-7 w-7 rounded-lg">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-2">
              <motion.div
                className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center"
                animate={isProcessing ? { 
                  boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.5)', '0 0 0 8px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.5)']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <img src={hummingbirdLogo} alt="Fix-ISH" className="h-4 w-4 object-contain" />
              </motion.div>
              <span className="text-xs font-semibold">FIX-ISH AGI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>System Load</span>
              <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: isProcessing ? '80%' : '15%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            
            <motion.div
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-medium ${
                isProcessing ? 'bg-primary/20 text-primary' : isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/20 text-destructive'
              }`}
              animate={isProcessing ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isProcessing ? 'bg-primary' : isOnline ? 'bg-emerald-400' : 'bg-destructive'}`} />
              {isProcessing ? 'PROCESSING' : isOnline ? 'ONLINE' : 'OFFLINE'}
            </motion.div>
          </div>
        </header>

        {/* Drop overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-4 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/30 rounded-xl"
            >
              <div className="text-center">
                <FileUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Drop files</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* LEFT PANEL - Subsystem Toolbar */}
          <aside className="w-14 border-r border-border/10 bg-background/10 backdrop-blur-xl flex flex-col items-center py-3 gap-1 shrink-0">
            {subsystems.map((sub) => {
              const isActive = systemStatus[sub.id as keyof typeof systemStatus]?.active;
              const isHovered = hoveredSubsystem === sub.id;
              const Icon = sub.icon;
              
              return (
                <Tooltip key={sub.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onMouseEnter={() => setHoveredSubsystem(sub.id)}
                      onMouseLeave={() => setHoveredSubsystem(null)}
                      onClick={() => setActiveSubsystem(activeSubsystem === sub.id ? null : sub.id)}
                      className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        activeSubsystem === sub.id 
                          ? 'bg-primary/20' 
                          : isHovered 
                            ? 'bg-muted/30' 
                            : 'bg-transparent'
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon 
                        className="h-4 w-4" 
                        style={{ color: isActive || activeSubsystem === sub.id ? sub.color : 'hsl(var(--muted-foreground) / 0.5)' }}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border"
                          style={{ borderColor: sub.color }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {sub.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
            <div className="flex-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={() => openFileDialog('*/*')}>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Add Input</TooltipContent>
            </Tooltip>
          </aside>

          {/* CENTER PANEL - AGI Live Feed */}
          <main className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Empty state */}
                {outputModules.length === 0 && !isProcessing && (
                  <motion.div 
                    className="text-center py-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="relative inline-flex items-center justify-center mb-6"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="absolute w-24 h-24 rounded-full border border-primary/10"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center border border-primary/10">
                        <img src={hummingbirdLogo} alt="Fix-ISH" className="h-10 w-10 object-contain opacity-60" />
                      </div>
                    </motion.div>
                    
                    <p className="text-sm text-muted-foreground/40 mb-2">AGI Console Ready</p>
                    <p className="text-xs text-muted-foreground/30">
                      Press <kbd className="px-1.5 py-0.5 bg-muted/20 rounded text-[10px]">⌘K</kbd> or use command bar
                    </p>
                  </motion.div>
                )}

                {/* Output Modules */}
                <AnimatePresence mode="popLayout">
                  {outputModules.map((module) => (
                    <OutputModuleCard key={module.id} module={module} />
                  ))}
                </AnimatePresence>

                {/* Processing indicator */}
                {isProcessing && outputModules.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-4"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* BOTTOM BAR - Command Input */}
            <div className="p-4 border-t border-border/10 bg-background/20 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto">
                {/* Media queue */}
                <AnimatePresence>
                  {mediaQueue.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-2 mb-3"
                    >
                      {mediaQueue.map((media, i) => (
                        <motion.div key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative group">
                          <div className="h-14 w-14 rounded-lg overflow-hidden border border-border/20 bg-muted/20">
                            {media.type === 'image' && <img src={media.url} alt="" className="h-full w-full object-cover" />}
                            {media.type === 'video' && <div className="h-full w-full flex items-center justify-center"><Video className="h-4 w-4 text-muted-foreground" /></div>}
                            {media.type === 'audio' && <div className="h-full w-full flex items-center justify-center"><Mic className="h-4 w-4 text-muted-foreground" /></div>}
                          </div>
                          <button
                            onClick={() => removeMedia(i)}
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Command bar */}
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple className="hidden" />
                  
                  {/* Quick actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[
                      { icon: ImageIcon, accept: 'image/*', label: 'Image' },
                      { icon: Video, accept: 'video/*', label: 'Video' },
                      { icon: Mic, accept: 'audio/*', label: 'Audio' },
                      { icon: Camera, accept: '', label: 'Camera' },
                      { icon: Monitor, accept: '', label: 'Screen' },
                    ].map((btn, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => btn.accept && openFileDialog(btn.accept)}
                            disabled={!btn.accept}
                          >
                            <btn.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{btn.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border/20" />

                  {/* Command input */}
                  <div className="flex-1 flex items-center gap-2 bg-muted/10 rounded-lg border border-border/20 px-3 py-2 focus-within:border-primary/30">
                    <Command className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <input
                      ref={commandInputRef}
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onFocus={() => setCommandPaletteOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          executeCommand();
                        }
                      }}
                      placeholder="Enter command or describe task..."
                      className="flex-1 bg-transparent border-0 text-sm placeholder:text-muted-foreground/30 focus:outline-none"
                    />
                    <kbd className="text-[9px] text-muted-foreground/40 bg-muted/20 px-1.5 py-0.5 rounded">⌘K</kbd>
                  </div>

                  <Button 
                    onClick={executeCommand}
                    disabled={isProcessing || !isOnline || (!command.trim() && mediaQueue.length === 0)}
                    size="sm"
                    className="h-9 px-4 rounded-lg"
                  >
                    {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                    <span className="ml-1.5 text-xs">Execute</span>
                  </Button>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT PANEL - System Intelligence */}
          <aside className="w-64 border-l border-border/10 bg-background/10 backdrop-blur-xl overflow-hidden shrink-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40">System Intelligence</p>

                {/* Tool Predictions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium">Tool Predictions</span>
                  </div>
                  {store.toolResult?.tools && store.toolResult.tools.length > 0 ? (
                    <div className="space-y-1.5">
                      {(Array.isArray(store.toolResult.tools) ? store.toolResult.tools : []).slice(0, 4).map((tool: any, i: number) => {
                        const name = typeof tool === 'string' ? tool : tool.name || tool.tool;
                        const conf = typeof tool === 'object' && tool.confidence ? tool.confidence : 70 + Math.random() * 30;
                        return (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between text-[9px]">
                              <span className="text-muted-foreground">{name}</span>
                              <span>{Math.round(conf)}%</span>
                            </div>
                            <div className="h-0.5 rounded-full bg-muted/30 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${conf}%` }}
                                className="h-full bg-primary/60 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[9px] text-muted-foreground/30">Waiting for input...</p>
                  )}
                </div>

                <div className="h-px bg-border/10" />

                {/* Future Memory */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium">Future Memory</span>
                  </div>
                  {store.futureResult?.next_steps && store.futureResult.next_steps.length > 0 ? (
                    <div className="space-y-1">
                      {store.futureResult.next_steps.slice(0, 4).map((step: any, i: number) => {
                        const text = typeof step === 'string' ? step : step.label || JSON.stringify(step);
                        return (
                          <div key={i} className="flex items-start gap-1.5 text-[9px] text-muted-foreground">
                            <div className="h-1 w-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            <span className="line-clamp-2">{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[9px] text-muted-foreground/30">No predictions</p>
                  )}
                </div>

                <div className="h-px bg-border/10" />

                {/* Safety Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-3 w-3 ${
                      systemStatus.safety.level === 'critical' ? 'text-destructive' :
                      systemStatus.safety.level === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                    }`} />
                    <span className="text-[10px] font-medium">Safety</span>
                  </div>
                  <div className={`text-[9px] px-2 py-1 rounded ${
                    systemStatus.safety.level === 'critical' ? 'bg-destructive/10 text-destructive' :
                    systemStatus.safety.level === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {systemStatus.safety.level === 'critical' ? 'CRITICAL' :
                     systemStatus.safety.level === 'warning' ? 'WARNING' : 'NORMAL'}
                  </div>
                </div>

                <div className="h-px bg-border/10" />

                {/* Vision Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium">Vision</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/10 rounded px-2 py-1.5">
                      <p className="text-[8px] text-muted-foreground/50 uppercase">Status</p>
                      <p className="text-[10px] font-medium">{systemStatus.vision.active ? 'Active' : 'Idle'}</p>
                    </div>
                    <div className="bg-muted/10 rounded px-2 py-1.5">
                      <p className="text-[8px] text-muted-foreground/50 uppercase">Objects</p>
                      <p className="text-[10px] font-medium">{systemStatus.vision.objects}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/10" />

                {/* Audio/Emotion */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Waves className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium">Emotion/Tone</span>
                  </div>
                  {systemStatus.audio.emotion ? (
                    <div className="bg-muted/10 rounded px-2 py-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">{systemStatus.audio.emotion}</span>
                        <span className="text-[9px] text-muted-foreground">{Math.round(systemStatus.audio.confidence * 100)}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] text-muted-foreground/30">No audio analyzed</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}
