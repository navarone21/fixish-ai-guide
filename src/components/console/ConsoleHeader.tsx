import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Zap } from "lucide-react";
import hummingbirdLogo from "@/assets/hummingbird-logo.png";
import { useNavigate } from "react-router-dom";

interface ConsoleHeaderProps {
  isProcessing: boolean;
  isOnline: boolean;
}

export function ConsoleHeader({ isProcessing, isOnline }: ConsoleHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border/10 bg-background/30 backdrop-blur-xl shrink-0 relative z-30">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")} 
          className="h-8 w-8 rounded-lg hover:bg-muted/20"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <motion.div
            className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10"
            animate={isProcessing ? { 
              boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.4)', '0 0 0 10px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.4)']
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.img 
              src={hummingbirdLogo} 
              alt="Fix-ISH" 
              className="h-5 w-5 object-contain"
              animate={{ 
                scaleX: [1, 0.8, 1, 0.8, 1],
                y: [0, -0.5, 0, -0.5, 0]
              }}
              transition={{ 
                duration: 0.2, 
                repeat: Infinity, 
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          <div>
            <h1 className="text-sm font-semibold flex items-center gap-2">
              FIX-ISH
              <span className="text-[10px] text-primary font-normal px-1.5 py-0.5 bg-primary/10 rounded">AGI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground/50">Multimodal Intelligence Console</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        {/* System load indicator */}
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
          <div className="w-20 h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
              animate={{ width: isProcessing ? '85%' : '12%' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground/40 w-8">
            {isProcessing ? '85%' : '12%'}
          </span>
        </div>
        
        {/* Status indicator */}
        <motion.div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium ${
            isProcessing 
              ? 'bg-primary/15 text-primary border border-primary/20' 
              : isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
          animate={isProcessing ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <motion.span 
            className={`h-2 w-2 rounded-full ${
              isProcessing ? 'bg-primary' : isOnline ? 'bg-emerald-400' : 'bg-destructive'
            }`}
            animate={isProcessing ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          {isProcessing ? (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              PROCESSING
            </span>
          ) : isOnline ? 'ONLINE' : 'OFFLINE'}
        </motion.div>
      </div>
    </header>
  );
}
