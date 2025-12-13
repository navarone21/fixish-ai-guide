import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Layers, Wrench, AlertTriangle, Waves, Cpu, BarChart3, 
  Command, Loader2, ChevronRight, ChevronDown, Check, X
} from "lucide-react";
import hummingbirdLogo from "@/assets/hummingbird-logo.png";
import { useState } from "react";

interface OutputModule {
  id: string;
  type: 'analysis' | 'steps' | 'tools' | 'warning' | 'vision' | 'audio' | 'memory' | 'diagram';
  title: string;
  content: any;
  timestamp: Date;
  status: 'processing' | 'complete' | 'error';
  media?: { type: string; url: string }[];
}

interface LiveIntelligenceFeedProps {
  outputModules: OutputModule[];
  isProcessing: boolean;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

function OutputModuleCard({ module }: { module: OutputModule }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  const getModuleColor = () => {
    switch (module.type) {
      case 'vision': return 'hsl(180 100% 60%)';
      case 'steps': return 'hsl(200 100% 60%)';
      case 'tools': return 'hsl(30 100% 60%)';
      case 'warning': return 'hsl(45 100% 60%)';
      case 'audio': return 'hsl(280 100% 60%)';
      case 'memory': return 'hsl(140 100% 50%)';
      default: return 'hsl(var(--primary))';
    }
  };

  const Icon = getModuleIcon();
  const color = getModuleColor();
  const isWarning = module.type === 'warning';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={spring}
      layout
      className={`rounded-xl border backdrop-blur-sm overflow-hidden ${
        isWarning 
          ? 'bg-amber-500/5 border-amber-500/20' 
          : 'bg-card/30 border-border/20'
      }`}
      style={{ boxShadow: `0 4px 20px -5px ${color}10` }}
    >
      {/* Header */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-full flex items-center justify-between px-4 py-3 border-b transition-colors ${
          isWarning ? 'border-amber-500/10 hover:bg-amber-500/5' : 'border-border/10 hover:bg-muted/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
            animate={module.status === 'processing' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color }} />
          </motion.div>
          <div className="text-left">
            <span className="text-sm font-medium">{module.title}</span>
            <span className="text-[10px] text-muted-foreground ml-2">
              {module.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {module.status === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-3.5 w-3.5 text-primary" />
            </motion.div>
          )}
          {module.status === 'complete' && (
            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="h-3 w-3 text-emerald-500" />
            </div>
          )}
          {module.status === 'error' && (
            <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-3 w-3 text-destructive" />
            </div>
          )}
          <motion.div animate={{ rotate: isCollapsed ? -90 : 0 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Media */}
              {module.media && module.media.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {module.media.map((m, i) => (
                    <motion.div 
                      key={i} 
                      className="rounded-lg overflow-hidden border border-border/20 max-w-[220px]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {m.type === 'image' && <img src={m.url} alt="" className="max-h-36 object-cover" />}
                      {m.type === 'video' && <video src={m.url} controls className="max-h-36" />}
                      {m.type === 'audio' && <audio src={m.url} controls className="w-52" />}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Text content */}
              {module.content.text && (
                <p className="text-sm text-foreground leading-relaxed">{module.content.text}</p>
              )}

              {/* Command */}
              {module.content.command && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/10 rounded-lg px-3 py-2">
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
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 group"
                    >
                      <motion.div 
                        className="h-6 w-6 rounded-lg bg-primary/10 text-primary text-[11px] flex items-center justify-center shrink-0 font-semibold"
                        whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--primary) / 0.2)' }}
                      >
                        {i + 1}
                      </motion.div>
                      <span className="text-sm text-muted-foreground pt-0.5 group-hover:text-foreground transition-colors">{step}</span>
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
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 400 }}
                    >
                      <Badge 
                        className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 cursor-default"
                      >
                        {tool}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {module.content.warnings && (
                <div className="space-y-2">
                  {module.content.warnings.map((w: string, i: number) => (
                    <motion.div 
                      key={i} 
                      className="flex items-start gap-2 text-sm text-amber-600 bg-amber-500/5 rounded-lg p-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Future predictions */}
              {module.content.predictions && (
                <div className="space-y-1.5 p-2 bg-violet-500/5 rounded-lg">
                  {module.content.predictions.slice(0, 6).map((p: any, i: number) => {
                    const text = typeof p === 'string' ? p : p.label || JSON.stringify(p);
                    return (
                      <motion.div 
                        key={i} 
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ChevronRight className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                        <span>{text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Error */}
              {module.content.error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{module.content.error}</p>
                </div>
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LiveIntelligenceFeed({ outputModules, isProcessing }: LiveIntelligenceFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [outputModules]);

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Empty state */}
        {outputModules.length === 0 && !isProcessing && (
          <motion.div 
            className="text-center py-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="relative inline-flex items-center justify-center mb-8"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Outer rings */}
              <motion.div
                className="absolute w-32 h-32 rounded-full border border-primary/5"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-24 h-24 rounded-full border border-primary/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Center logo */}
              <motion.div 
                className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10"
                animate={{ 
                  boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.1)', '0 0 30px 5px hsl(var(--primary) / 0.15)', '0 0 0 0 hsl(var(--primary) / 0.1)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <img src={hummingbirdLogo} alt="Fix-ISH" className="h-12 w-12 object-contain opacity-70" />
              </motion.div>
            </motion.div>
            
            <h3 className="text-lg font-medium text-foreground/80 mb-2">AGI Console Ready</h3>
            <p className="text-sm text-muted-foreground/50 mb-4">
              Multimodal intelligence system standing by
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/40">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-muted/10 rounded text-[11px] font-mono">⌘K</kbd>
              <span>or use command bar below</span>
            </div>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 py-6"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Processing intelligence...</span>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}
