import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, Clock, Shield, Eye, Waves, Cpu, 
  ChevronRight, TrendingUp, Activity, Zap
} from "lucide-react";

interface IntelligencePanelProps {
  toolResult: { tools?: any[] } | null;
  futureResult: { next_steps?: any[] } | null;
  systemStatus: {
    vision: { active: boolean; fps: number; objects: number };
    audio: { active: boolean; emotion: string; confidence: number };
    safety: { active: boolean; level: 'normal' | 'warning' | 'critical' };
    memory: { active: boolean; entries: number };
  };
  isProcessing: boolean;
}

export function IntelligencePanel({ 
  toolResult, 
  futureResult, 
  systemStatus,
  isProcessing 
}: IntelligencePanelProps) {
  return (
    <aside className="w-72 border-l border-border/10 bg-background/10 backdrop-blur-xl overflow-hidden shrink-0">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-5">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"
                animate={isProcessing ? { 
                  boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.4)', '0 0 0 6px hsl(var(--primary) / 0)']
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Cpu className="h-3 w-3 text-primary" />
              </motion.div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Intelligence</span>
            </div>
            <motion.div
              className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-primary' : 'bg-muted-foreground/20'}`}
              animate={isProcessing ? { opacity: [1, 0.4, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </div>

          {/* Tool Predictions */}
          <motion.div 
            className="space-y-3 p-3 rounded-xl bg-gradient-to-br from-muted/5 to-muted/10 border border-border/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Wrench className="h-3 w-3 text-amber-500" />
                </div>
                <span className="text-xs font-medium">Tool Predictions</span>
              </div>
              {toolResult?.tools?.length && (
                <Badge variant="secondary" className="text-[9px] h-4">
                  {toolResult.tools.length}
                </Badge>
              )}
            </div>
            
            {toolResult?.tools && toolResult.tools.length > 0 ? (
              <div className="space-y-2">
                {(Array.isArray(toolResult.tools) ? toolResult.tools : []).slice(0, 5).map((tool: any, i: number) => {
                  const name = typeof tool === 'string' ? tool : tool.name || tool.tool;
                  const conf = typeof tool === 'object' && tool.confidence ? tool.confidence : 70 + Math.random() * 30;
                  return (
                    <motion.div 
                      key={i} 
                      className="space-y-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground truncate max-w-[120px]">{name}</span>
                        <span className="font-medium text-amber-500">{Math.round(conf)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted/20 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${conf}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-3">
                <Wrench className="h-5 w-5 text-muted-foreground/20 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground/40">Awaiting analysis...</p>
              </div>
            )}
          </motion.div>

          {/* Future Memory */}
          <motion.div 
            className="space-y-3 p-3 rounded-xl bg-gradient-to-br from-muted/5 to-muted/10 border border-border/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-violet-500" />
                </div>
                <span className="text-xs font-medium">Future Memory</span>
              </div>
              <TrendingUp className="h-3 w-3 text-muted-foreground/30" />
            </div>
            
            {futureResult?.next_steps && futureResult.next_steps.length > 0 ? (
              <div className="space-y-1.5">
                {futureResult.next_steps.slice(0, 5).map((step: any, i: number) => {
                  const text = typeof step === 'string' ? step : step.label || JSON.stringify(step);
                  return (
                    <motion.div 
                      key={i} 
                      className="flex items-start gap-2 text-[10px] text-muted-foreground group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ChevronRight className="h-3 w-3 text-violet-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                      <span className="line-clamp-2 group-hover:text-foreground transition-colors">{text}</span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-3">
                <Clock className="h-5 w-5 text-muted-foreground/20 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground/40">No predictions yet</p>
              </div>
            )}
          </motion.div>

          {/* System Status Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Safety Status */}
            <motion.div 
              className={`p-3 rounded-xl border ${
                systemStatus.safety.level === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                systemStatus.safety.level === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 
                'bg-emerald-500/5 border-emerald-500/20'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Shield className={`h-4 w-4 mb-1.5 ${
                systemStatus.safety.level === 'critical' ? 'text-destructive' :
                systemStatus.safety.level === 'warning' ? 'text-amber-500' : 'text-emerald-500'
              }`} />
              <p className="text-[8px] text-muted-foreground/60 uppercase">Safety</p>
              <p className={`text-[10px] font-semibold ${
                systemStatus.safety.level === 'critical' ? 'text-destructive' :
                systemStatus.safety.level === 'warning' ? 'text-amber-500' : 'text-emerald-400'
              }`}>
                {systemStatus.safety.level.toUpperCase()}
              </p>
            </motion.div>

            {/* Vision Status */}
            <motion.div 
              className="p-3 rounded-xl bg-muted/5 border border-border/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Eye className={`h-4 w-4 mb-1.5 ${systemStatus.vision.active ? 'text-cyan-500' : 'text-muted-foreground/30'}`} />
              <p className="text-[8px] text-muted-foreground/60 uppercase">Vision</p>
              <p className="text-[10px] font-semibold">
                {systemStatus.vision.active ? `${systemStatus.vision.objects} obj` : 'Idle'}
              </p>
            </motion.div>

            {/* Memory Status */}
            <motion.div 
              className="p-3 rounded-xl bg-muted/5 border border-border/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Cpu className={`h-4 w-4 mb-1.5 ${systemStatus.memory.active ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
              <p className="text-[8px] text-muted-foreground/60 uppercase">Memory</p>
              <p className="text-[10px] font-semibold">
                {systemStatus.memory.entries || 0} entries
              </p>
            </motion.div>

            {/* Audio/Emotion */}
            <motion.div 
              className="p-3 rounded-xl bg-muted/5 border border-border/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Waves className={`h-4 w-4 mb-1.5 ${systemStatus.audio.emotion ? 'text-violet-500' : 'text-muted-foreground/30'}`} />
              <p className="text-[8px] text-muted-foreground/60 uppercase">Emotion</p>
              <p className="text-[10px] font-semibold truncate">
                {systemStatus.audio.emotion || 'None'}
              </p>
            </motion.div>
          </div>

          {/* Activity Graph Placeholder */}
          <motion.div 
            className="p-3 rounded-xl bg-muted/5 border border-border/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium">System Activity</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ 
                    height: isProcessing 
                      ? `${20 + Math.sin(Date.now() / 200 + i) * 30 + Math.random() * 50}%`
                      : `${10 + Math.random() * 30}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </aside>
  );
}
