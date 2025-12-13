import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, Box, Wrench, AlertTriangle, Waves, Cpu, Clock, 
  Brain, Target, TrendingUp, ChevronRight, Zap, Shield,
  CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp,
  X, GripVertical, Code, Play, Pause, Video, SkipForward, SkipBack
} from "lucide-react";

interface ModuleProps {
  id: string;
  onClose: (id: string) => void;
  onCollapse?: () => void;
}

// Base Module Wrapper with Apple-like styling
function ModuleWrapper({ 
  children, 
  id,
  icon: Icon, 
  title, 
  color, 
  badge,
  onClose,
  defaultCollapsed = false 
}: { 
  children: React.ReactNode;
  id: string;
  icon: any;
  title: string;
  color: string;
  badge?: string | number;
  onClose: (id: string) => void;
  defaultCollapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="rounded-2xl border backdrop-blur-xl overflow-hidden group"
      style={{ 
        borderColor: `${color}20`,
        background: `linear-gradient(135deg, ${color}05 0%, transparent 50%)`,
        boxShadow: `0 4px 24px -4px ${color}10`
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ background: `linear-gradient(90deg, ${color}08, transparent)` }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3 flex-1">
          <motion.div 
            className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
            whileHover={{ scale: 1.05 }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </motion.div>
          <span className="text-sm font-medium">{title}</span>
          {badge !== undefined && (
            <Badge variant="secondary" className="text-[9px] h-5 px-2" style={{ backgroundColor: `${color}15`, color }}>
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-lg"
            onClick={(e) => { e.stopPropagation(); onClose(id); }}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
        
        <motion.div animate={{ rotate: isCollapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Vision Analysis Board
export function VisionAnalysisModule({ 
  id,
  imageUrl, 
  objects,
  onClose 
}: ModuleProps & { 
  imageUrl?: string;
  objects: { name: string; confidence: number; bbox?: number[] }[];
}) {
  const [showJson, setShowJson] = useState(false);

  return (
    <ModuleWrapper id={id} icon={Eye} title="Vision Analysis" color="hsl(180 100% 60%)" badge={`${objects.length} detected`} onClose={onClose}>
      <div className="space-y-4">
        {/* Frame preview with overlays */}
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-border/20">
            <img src={imageUrl} alt="Analysis" className="w-full h-48 object-cover" />
            {/* Object overlays would go here */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              {objects.slice(0, 4).map((obj, i) => (
                <Badge key={i} className="text-[9px] bg-cyan-500/80 text-white border-0">
                  {obj.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Detected objects grid */}
        <div className="grid grid-cols-2 gap-2">
          {objects.map((obj, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/10"
            >
              <Target className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium truncate block">{obj.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${obj.confidence * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                    />
                  </div>
                  <span className="text-[9px] text-cyan-400 font-medium">{Math.round(obj.confidence * 100)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* JSON toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs gap-2 h-8"
          onClick={() => setShowJson(!showJson)}
        >
          <Code className="h-3 w-3" />
          {showJson ? 'Hide' : 'View'} Raw JSON
        </Button>

        <AnimatePresence>
          {showJson && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-[10px] bg-background/50 rounded-lg p-3 overflow-x-auto text-muted-foreground"
            >
              {JSON.stringify(objects, null, 2)}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
    </ModuleWrapper>
  );
}

// Video Frame Analysis Module
export function VideoFrameModule({ 
  id,
  videoUrl,
  frames,
  onClose 
}: ModuleProps & { 
  videoUrl?: string;
  frames: { timestamp: number; objects: { name: string; confidence: number }[]; thumbnail?: string }[];
}) {
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setSelectedFrame(prev => (prev + 1) % frames.length);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, frames.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ModuleWrapper id={id} icon={Video} title="Video Frame Analysis" color="hsl(200 100% 60%)" badge={`${frames.length} frames`} onClose={onClose}>
      <div className="space-y-4">
        {/* Timeline thumbnails */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted/20">
          {frames.map((frame, i) => (
            <motion.button
              key={i}
              onClick={() => setSelectedFrame(i)}
              className={`shrink-0 relative rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedFrame ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border/20 hover:border-blue-500/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-16 h-10 bg-gradient-to-br from-blue-500/10 to-blue-400/5 flex items-center justify-center">
                <span className="text-[9px] font-mono text-blue-400">{formatTime(frame.timestamp)}</span>
              </div>
              {i === selectedFrame && (
                <motion.div 
                  className="absolute inset-0 bg-blue-500/10"
                  layoutId="frame-highlight"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setSelectedFrame(prev => Math.max(0, prev - 1))}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-blue-500/10"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4 text-blue-500" /> : <Play className="h-4 w-4 text-blue-500" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setSelectedFrame(prev => Math.min(frames.length - 1, prev + 1))}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selected frame details */}
        {frames[selectedFrame] && (
          <motion.div 
            key={selectedFrame}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-background/50 border border-blue-500/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-400">Frame {selectedFrame + 1}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{formatTime(frames[selectedFrame].timestamp)}</span>
            </div>
            <div className="space-y-1.5">
              {frames[selectedFrame].objects.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="text-[11px] flex-1">{obj.name}</span>
                  <span className="text-[9px] text-blue-400">{Math.round(obj.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ModuleWrapper>
  );
}

// Tool Prediction Cards
export function ToolPredictionModule({ 
  id,
  tools,
  onClose 
}: ModuleProps & { 
  tools: { name: string; confidence: number; description?: string; icon?: string }[];
}) {
  return (
    <ModuleWrapper id={id} icon={Wrench} title="Tool Predictions" color="hsl(30 100% 60%)" badge={tools.length} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="p-3 rounded-xl bg-background/50 border border-orange-500/10 cursor-default group/card"
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div 
                className="h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                <Wrench className="h-3.5 w-3.5 text-orange-500" />
              </motion.div>
              <span className="text-xs font-medium flex-1 truncate">{tool.name}</span>
            </div>
            {tool.description && (
              <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{tool.description}</p>
            )}
            <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${tool.confidence * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            </div>
            <span className="text-[9px] text-orange-400 mt-1 block">{Math.round(tool.confidence * 100)}% match</span>
          </motion.div>
        ))}
      </div>
    </ModuleWrapper>
  );
}

// Repair Sequence Steps
export function RepairSequenceModule({ 
  id,
  steps,
  onClose 
}: ModuleProps & { 
  steps: { title: string; description?: string; duration?: string }[];
}) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <ModuleWrapper id={id} icon={Zap} title="Repair Sequence" color="hsl(200 100% 60%)" badge={`${steps.length} steps`} onClose={onClose}>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            {/* Connection line */}
            {i < steps.length - 1 && (
              <div className="absolute left-4 top-10 w-0.5 h-[calc(100%-8px)] bg-gradient-to-b from-blue-500/30 to-transparent" />
            )}
            
            <motion.button
              onClick={() => setExpandedStep(expandedStep === i ? null : i)}
              className="w-full flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-blue-500/10 text-left hover:bg-background/80 transition-colors"
              whileHover={{ x: 4 }}
            >
              <motion.div 
                className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-sm font-semibold text-blue-500"
                animate={expandedStep === i ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {i + 1}
              </motion.div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{step.title}</span>
                {step.duration && (
                  <span className="text-[10px] text-muted-foreground">~{step.duration}</span>
                )}
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground/50 transition-transform ${expandedStep === i ? 'rotate-90' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {expandedStep === i && step.description && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-11 mt-1 overflow-hidden"
                >
                  <p className="text-xs text-muted-foreground p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    {step.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </ModuleWrapper>
  );
}

// Reasoning Snapshot with neural activation
export function ReasoningModule({ 
  id,
  reasoning,
  onClose 
}: ModuleProps & { 
  reasoning: { step: string; confidence: number }[];
}) {
  return (
    <ModuleWrapper id={id} icon={Brain} title="AGI Reasoning" color="hsl(140 100% 50%)" onClose={onClose}>
      <div className="relative">
        {/* Neural activation animation */}
        <motion.div 
          className="absolute -inset-4 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle at 50% 50%, hsl(140 100% 50% / 0.05), transparent 60%)'
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative space-y-3">
          {reasoning.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex items-start gap-3"
            >
              <motion.div
                className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"
                animate={{ 
                  boxShadow: ['0 0 0 0 hsl(140 100% 50% / 0.3)', '0 0 8px 2px hsl(140 100% 50% / 0.2)', '0 0 0 0 hsl(140 100% 50% / 0.3)']
                }}
                transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity }}
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </motion.div>
              <div className="flex-1">
                <p className="text-xs text-foreground/90">{step.step}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${step.confidence * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.15 }}
                    />
                  </div>
                  <span className="text-[9px] text-emerald-400 font-medium">{Math.round(step.confidence * 100)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ModuleWrapper>
  );
}

// Future Memory Projection
export function FutureMemoryModule({ 
  id,
  past,
  current,
  future,
  onClose 
}: ModuleProps & { 
  past: string[];
  current: string;
  future: string[];
}) {
  return (
    <ModuleWrapper id={id} icon={Clock} title="Timeline Projection" color="hsl(280 100% 60%)" onClose={onClose}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted/20 via-violet-500/50 to-primary/30" />

        <div className="space-y-4 pl-10">
          {/* Past */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Past</span>
            {past.slice(-2).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.5 }}
                className="relative text-[11px] text-muted-foreground p-2 rounded-lg bg-muted/5"
              >
                <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-muted/30" />
                {item}
              </motion.div>
            ))}
          </div>

          {/* Current */}
          <motion.div
            className="relative text-xs p-3 rounded-xl bg-violet-500/10 border border-violet-500/20"
            animate={{ 
              boxShadow: ['0 0 0 0 hsl(280 100% 60% / 0.2)', '0 0 15px 3px hsl(280 100% 60% / 0.15)', '0 0 0 0 hsl(280 100% 60% / 0.2)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-violet-500 ring-4 ring-violet-500/20" />
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3 w-3 text-violet-500" />
              <span className="text-[9px] uppercase tracking-wider text-violet-400">Current</span>
            </div>
            {current}
          </motion.div>

          {/* Future */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Predicted
            </span>
            {future.slice(0, 3).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className="relative text-[11px] text-muted-foreground p-2 rounded-lg bg-primary/5 border border-dashed border-primary/20"
              >
                <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary/40" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
}

// Safety Assessment Module
export function SafetyModule({ 
  id,
  level,
  alerts,
  onClose 
}: ModuleProps & { 
  level: 'normal' | 'warning' | 'critical';
  alerts: { severity: 'info' | 'warning' | 'critical'; message: string }[];
}) {
  const levelConfig = {
    normal: { color: 'hsl(140 100% 50%)', label: 'All Clear', icon: CheckCircle2 },
    warning: { color: 'hsl(45 100% 50%)', label: 'Caution', icon: AlertTriangle },
    critical: { color: 'hsl(0 80% 60%)', label: 'Critical', icon: XCircle }
  };

  const config = levelConfig[level];
  const StatusIcon = config.icon;

  return (
    <ModuleWrapper id={id} icon={Shield} title="Safety Assessment" color={config.color} badge={alerts.length > 0 ? `${alerts.length} alerts` : undefined} onClose={onClose}>
      <div className="space-y-3">
        {/* Status banner */}
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: `${config.color}10` }}
          animate={level !== 'normal' ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <StatusIcon className="h-5 w-5" style={{ color: config.color }} />
          <div>
            <span className="text-sm font-medium" style={{ color: config.color }}>{config.label}</span>
            <p className="text-[10px] text-muted-foreground">
              {level === 'normal' ? 'No hazards detected' : `${alerts.length} issue${alerts.length > 1 ? 's' : ''} found`}
            </p>
          </div>
        </motion.div>

        {/* Alerts list */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const alertColor = alert.severity === 'critical' ? 'hsl(0 80% 60%)' : 
                               alert.severity === 'warning' ? 'hsl(45 100% 50%)' : 'hsl(200 100% 60%)';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 p-2.5 rounded-lg"
                  style={{ backgroundColor: `${alertColor}10` }}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: alertColor }} />
                  <span className="text-xs">{alert.message}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
}

// Emotion Analysis Module
export function EmotionModule({ 
  id,
  emotions,
  waveformUrl,
  onClose 
}: ModuleProps & { 
  emotions: { label: string; value: number; color: string }[];
  waveformUrl?: string;
}) {
  return (
    <ModuleWrapper id={id} icon={Waves} title="Emotion Analysis" color="hsl(280 100% 60%)" onClose={onClose}>
      <div className="space-y-4">
        {/* Waveform preview */}
        <div className="h-16 rounded-xl bg-background/50 border border-border/10 flex items-center justify-center overflow-hidden">
          <motion.div className="flex items-end gap-0.5 h-10">
            {[...Array(32)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-violet-500/50 to-violet-400 rounded-full"
                animate={{ 
                  height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`]
                }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.02 }}
              />
            ))}
          </motion.div>
        </div>

        {/* Emotion bars */}
        <div className="space-y-3">
          {emotions.map((emotion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{emotion.label}</span>
                <span style={{ color: emotion.color }} className="font-medium">{Math.round(emotion.value * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emotion.value * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.12 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: emotion.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ModuleWrapper>
  );
}

// Memory Retrieval Module
export function MemoryRetrievalModule({ 
  id,
  memories,
  onClose 
}: ModuleProps & { 
  memories: { content: string; relevance: number; timestamp: string }[];
}) {
  return (
    <ModuleWrapper id={id} icon={Cpu} title="Memory Retrieval" color="hsl(140 100% 50%)" badge={memories.length} onClose={onClose}>
      <div className="space-y-2">
        {memories.map((mem, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl bg-background/50 border border-emerald-500/10"
          >
            <p className="text-xs text-foreground/90 line-clamp-2 mb-2">{mem.content}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground">{mem.timestamp}</span>
              <Badge variant="outline" className="text-[8px] h-4 border-emerald-500/20 text-emerald-500">
                {Math.round(mem.relevance * 100)}% match
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </ModuleWrapper>
  );
}
