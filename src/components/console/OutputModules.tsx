import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, Box, Wrench, AlertTriangle, Waves, Cpu, Clock, 
  Brain, Target, TrendingUp, ChevronRight, Zap, Shield,
  CheckCircle2, XCircle, ArrowRight
} from "lucide-react";
import { useState } from "react";

// Object Detection Module
export function ObjectDetectionModule({ objects }: { objects: { name: string; confidence: number; bbox?: number[] }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-cyan-500/10 bg-cyan-500/5">
        <Box className="h-4 w-4 text-cyan-500" />
        <span className="text-sm font-medium">Object Detection</span>
        <Badge variant="secondary" className="ml-auto text-[9px]">{objects.length} detected</Badge>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {objects.map((obj, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-background/30"
          >
            <Target className="h-3 w-3 text-cyan-500" />
            <span className="text-xs flex-1 truncate">{obj.name}</span>
            <span className="text-[10px] text-cyan-400">{Math.round(obj.confidence * 100)}%</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Emotion/Tone Bars Module
export function EmotionBarsModule({ emotions }: { emotions: { label: string; value: number; color: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/10 bg-violet-500/5">
        <Waves className="h-4 w-4 text-violet-500" />
        <span className="text-sm font-medium">Emotion Analysis</span>
      </div>
      <div className="p-4 space-y-3">
        {emotions.map((emotion, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{emotion.label}</span>
              <span style={{ color: emotion.color }}>{Math.round(emotion.value * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${emotion.value * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: emotion.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// AGI Reasoning Snapshot
export function ReasoningModule({ reasoning }: { reasoning: { step: string; confidence: number }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/10 bg-emerald-500/5">
        <Brain className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-medium">AGI Reasoning</span>
      </div>
      <div className="p-4 space-y-2">
        {reasoning.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            <motion.div
              className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] flex items-center justify-center shrink-0 mt-0.5"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ delay: i * 0.2, duration: 0.3 }}
            >
              {i + 1}
            </motion.div>
            <div className="flex-1">
              <p className="text-xs text-foreground/80">{step.step}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-0.5 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${step.confidence * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                  />
                </div>
                <span className="text-[9px] text-emerald-400">{Math.round(step.confidence * 100)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Timeline Progression Module
export function TimelineModule({ 
  past, 
  current, 
  future 
}: { 
  past: string[]; 
  current: string; 
  future: string[] 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-500/10 bg-amber-500/5">
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">Timeline Progression</span>
      </div>
      <div className="p-4">
        <div className="flex items-stretch gap-2">
          {/* Past */}
          <div className="flex-1 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 flex items-center gap-1">
              <span>Past</span>
            </div>
            {past.slice(-2).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-[10px] text-muted-foreground p-2 rounded-lg bg-muted/5 border border-muted/10"
              >
                {item}
              </motion.div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <ArrowRight className="h-4 w-4 text-amber-500/50" />
          </div>

          {/* Current */}
          <div className="flex-1 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-amber-500 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Now</span>
            </div>
            <motion.div
              className="text-xs text-foreground p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
              animate={{ boxShadow: ['0 0 0 0 hsl(45 100% 60% / 0.2)', '0 0 10px 2px hsl(45 100% 60% / 0.1)', '0 0 0 0 hsl(45 100% 60% / 0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {current}
            </motion.div>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <ArrowRight className="h-4 w-4 text-amber-500/50" />
          </div>

          {/* Future */}
          <div className="flex-1 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Predicted</span>
            </div>
            {future.slice(0, 2).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="text-[10px] text-muted-foreground p-2 rounded-lg bg-primary/5 border border-primary/10 border-dashed"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Safety Alerts Module
export function SafetyAlertsModule({ alerts }: { alerts: { level: 'warning' | 'critical' | 'info'; message: string }[] }) {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'critical': return { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: XCircle, color: 'text-destructive' };
      case 'warning': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, color: 'text-amber-500' };
      default: return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Shield, color: 'text-blue-500' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-destructive/10 bg-destructive/5">
        <Shield className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium">Safety Analysis</span>
        <Badge variant="destructive" className="ml-auto text-[9px]">{alerts.length} alerts</Badge>
      </div>
      <div className="p-3 space-y-2">
        {alerts.map((alert, i) => {
          const styles = getLevelStyles(alert.level);
          const Icon = styles.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-2 p-2.5 rounded-lg ${styles.bg} ${styles.border} border`}
            >
              <Icon className={`h-4 w-4 ${styles.color} shrink-0 mt-0.5`} />
              <span className="text-xs text-foreground/80">{alert.message}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Tool Prediction Cards
export function ToolCardsModule({ tools }: { tools: { name: string; confidence: number; category?: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-orange-500/10 bg-orange-500/5">
        <Wrench className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium">Tool Predictions</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-lg bg-background/30 border border-orange-500/10 cursor-default"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium truncate">{tool.name}</span>
            </div>
            <div className="h-1 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500/60 to-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${tool.confidence * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              />
            </div>
            <span className="text-[9px] text-orange-400 mt-1 block">{Math.round(tool.confidence * 100)}% match</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Memory Retrieval Module
export function MemoryModule({ memories }: { memories: { content: string; relevance: number; timestamp: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/10 bg-emerald-500/5">
        <Cpu className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-medium">Memory Retrieval</span>
      </div>
      <div className="p-3 space-y-2">
        {memories.map((mem, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-2.5 rounded-lg bg-background/30 border border-emerald-500/10"
          >
            <p className="text-xs text-foreground/80 line-clamp-2">{mem.content}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-muted-foreground">{mem.timestamp}</span>
              <Badge variant="outline" className="text-[8px] text-emerald-500 border-emerald-500/20">
                {Math.round(mem.relevance * 100)}% relevant
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
