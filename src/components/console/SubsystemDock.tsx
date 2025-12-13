import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Video, Waves, FileText, Sparkles, Cpu, Wrench, Shield, ScanLine, 
  Camera, Upload, Play, Pause, Trash2, RefreshCw, Zap, AlertTriangle,
  Plus, X
} from "lucide-react";

interface SubsystemStatus {
  active: boolean;
  status: 'idle' | 'warming' | 'processing' | 'ready' | 'error';
  data?: any;
}

interface SubsystemDockProps {
  systemStatus: Record<string, any>;
  onUpload: (type: string, accept: string) => void;
  onAction: (subsystem: string, action: string) => void;
}

const subsystems = [
  { 
    id: 'vision', 
    icon: Eye, 
    label: 'Vision', 
    color: 'hsl(180 100% 60%)',
    actions: [
      { id: 'upload-image', icon: Upload, label: 'Upload Image', accept: 'image/*' },
      { id: 'live-camera', icon: Camera, label: 'Live Camera' },
    ]
  },
  { 
    id: 'video', 
    icon: Video, 
    label: 'Video', 
    color: 'hsl(200 100% 60%)',
    actions: [
      { id: 'upload-video', icon: Upload, label: 'Upload Video', accept: 'video/*' },
      { id: 'record', icon: Play, label: 'Record' },
    ]
  },
  { 
    id: 'audio', 
    icon: Waves, 
    label: 'Audio/Emotion', 
    color: 'hsl(280 100% 60%)',
    actions: [
      { id: 'upload-audio', icon: Upload, label: 'Upload Audio', accept: 'audio/*' },
      { id: 'record-audio', icon: Waves, label: 'Record' },
    ]
  },
  { 
    id: 'documents', 
    icon: FileText, 
    label: 'Documents', 
    color: 'hsl(40 100% 60%)',
    actions: [
      { id: 'upload-doc', icon: Upload, label: 'Upload PDF/Scan', accept: '.pdf,.png,.jpg,.jpeg' },
    ]
  },
  { 
    id: 'tools', 
    icon: Wrench, 
    label: 'Tools', 
    color: 'hsl(30 100% 60%)',
    actions: [
      { id: 'predict-tools', icon: Zap, label: 'Run Prediction' },
      { id: 'clear-tools', icon: RefreshCw, label: 'Clear' },
    ]
  },
  { 
    id: 'memory', 
    icon: Cpu, 
    label: 'Memory', 
    color: 'hsl(140 100% 50%)',
    actions: [
      { id: 'retrieve', icon: RefreshCw, label: 'Retrieve' },
      { id: 'inject', icon: Plus, label: 'Inject' },
      { id: 'clear-memory', icon: Trash2, label: 'Clear' },
    ]
  },
  { 
    id: 'safety', 
    icon: Shield, 
    label: 'Safety', 
    color: 'hsl(0 80% 60%)',
    actions: [
      { id: 'view-flags', icon: AlertTriangle, label: 'View Flags' },
    ]
  },
  { 
    id: 'ar', 
    icon: ScanLine, 
    label: 'Live AR', 
    color: 'hsl(260 100% 65%)',
    actions: [
      { id: 'start-ar', icon: Play, label: 'Start AR' },
      { id: 'capture', icon: Camera, label: 'Capture' },
    ]
  },
];

export function SubsystemDock({ systemStatus, onUpload, onAction }: SubsystemDockProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => setExpandedId(id), 120);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => setExpandedId(null), 250);
    setHoverTimeout(timeout);
  };

  const getStatusColor = (status: SubsystemStatus['status']) => {
    switch (status) {
      case 'processing': return 'bg-primary animate-pulse';
      case 'warming': return 'bg-amber-500 animate-pulse';
      case 'ready': return 'bg-emerald-500';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted-foreground/30';
    }
  };

  const getStatusLabel = (status: SubsystemStatus['status']) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'warming': return 'Warming Up';
      case 'ready': return 'Ready';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };

  return (
    <aside className="w-14 border-r border-border/10 bg-background/10 backdrop-blur-xl flex flex-col items-center py-3 gap-1 shrink-0 relative z-20">
      {subsystems.map((sub) => {
        const status = systemStatus[sub.id] || { active: false, status: 'idle' };
        const isExpanded = expandedId === sub.id;
        const Icon = sub.icon;

        return (
          <div 
            key={sub.id} 
            className="relative"
            onMouseEnter={() => handleMouseEnter(sub.id)}
            onMouseLeave={handleMouseLeave}
          >
            <motion.button
              onClick={() => setExpandedId(isExpanded ? null : sub.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                isExpanded ? 'bg-primary/20' : status.active ? 'bg-primary/10' : 'hover:bg-muted/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={status.status === 'processing' ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.5, repeat: status.status === 'processing' ? Infinity : 0 }}
            >
              <Icon 
                className="h-4 w-4 transition-colors" 
                style={{ color: isExpanded || status.active ? sub.color : 'hsl(var(--muted-foreground) / 0.5)' }}
              />
              
              {/* Status indicator */}
              <div className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${getStatusColor(status.status)}`} />
              
              {/* Active glow ring */}
              {status.active && (
                <motion.div
                  className="absolute inset-0 rounded-lg border"
                  style={{ borderColor: sub.color }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>

            {/* Expanded drawer */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute left-full top-0 ml-2 z-50"
                >
                  <div 
                    className="bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl p-3 shadow-xl min-w-[180px]"
                    style={{ boxShadow: `0 0 30px ${sub.color}15` }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" style={{ color: sub.color }} />
                        <span className="text-xs font-medium">{sub.label}</span>
                      </div>
                      <button 
                        onClick={() => setExpandedId(null)}
                        className="h-5 w-5 rounded flex items-center justify-center hover:bg-muted/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-muted/10">
                      <div className={`h-1.5 w-1.5 rounded-full ${getStatusColor(status.status)}`} />
                      <span className="text-[10px] text-muted-foreground">{getStatusLabel(status.status)}</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1">
                      {sub.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8 text-xs gap-2"
                          onClick={() => {
                            if (action.accept) {
                              onUpload(sub.id, action.accept);
                            } else {
                              onAction(sub.id, action.id);
                            }
                          }}
                        >
                          <action.icon className="h-3 w-3" style={{ color: sub.color }} />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      
      <div className="flex-1" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 rounded-lg hover:bg-primary/10"
        onClick={() => onUpload('any', '*/*')}
      >
        <Plus className="h-4 w-4 text-muted-foreground" />
      </Button>
    </aside>
  );
}
