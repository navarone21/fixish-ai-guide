import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Command, Send, Zap, Loader2, X,
  Image as ImageIcon, Video, Mic, Camera, Monitor,
  Eye, Wrench, Cpu, Shield, Layers, Clock, ScanLine, FileText
} from "lucide-react";

interface MediaItem {
  type: string;
  url: string;
  file: File;
  name: string;
}

interface CommandBarProps {
  command: string;
  setCommand: (cmd: string) => void;
  mediaQueue: MediaItem[];
  onRemoveMedia: (index: number) => void;
  onOpenFileDialog: (accept: string) => void;
  onExecute: () => void;
  isProcessing: boolean;
  isOnline: boolean;
}

const commands = [
  { cmd: '/vision', icon: Eye, label: 'Analyze image or video', color: 'hsl(180 100% 60%)' },
  { cmd: '/analyze', icon: Zap, label: 'Deep analysis with AGI', color: 'hsl(var(--primary))' },
  { cmd: '/repair', icon: Wrench, label: 'Generate repair steps', color: 'hsl(30 100% 60%)' },
  { cmd: '/tools', icon: Wrench, label: 'Predict required tools', color: 'hsl(40 100% 60%)' },
  { cmd: '/steps', icon: Layers, label: 'Step-by-step breakdown', color: 'hsl(200 100% 60%)' },
  { cmd: '/memory', icon: Cpu, label: 'Access memory system', color: 'hsl(140 100% 50%)' },
  { cmd: '/future', icon: Clock, label: 'Predict future states', color: 'hsl(280 100% 60%)' },
  { cmd: '/safety', icon: Shield, label: 'Safety analysis', color: 'hsl(0 80% 60%)' },
  { cmd: '/ar', icon: ScanLine, label: 'Start AR mode', color: 'hsl(260 100% 65%)' },
  { cmd: '/document', icon: FileText, label: 'Analyze document', color: 'hsl(50 100% 60%)' },
];

export function CommandBar({
  command,
  setCommand,
  mediaQueue,
  onRemoveMedia,
  onOpenFileDialog,
  onExecute,
  isProcessing,
  isOnline
}: CommandBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = command.startsWith('/')
    ? commands.filter(c => c.cmd.toLowerCase().includes(command.toLowerCase()))
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        setCommand(filteredCommands[selectedIndex].cmd + ' ');
        setShowSuggestions(false);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onExecute();
    }
  };

  return (
    <div className="p-4 border-t border-border/10 bg-background/30 backdrop-blur-xl relative">
      <div className="max-w-4xl mx-auto">
        {/* Command suggestions overlay */}
        <AnimatePresence>
          {showSuggestions && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 max-w-4xl mx-auto"
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl overflow-hidden shadow-xl">
                <div className="p-2 border-b border-border/10">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Commands</span>
                </div>
                <div className="p-1 max-h-64 overflow-y-auto">
                  {filteredCommands.map((cmd, i) => (
                    <motion.button
                      key={cmd.cmd}
                      onClick={() => {
                        setCommand(cmd.cmd + ' ');
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        i === selectedIndex ? 'bg-primary/10' : 'hover:bg-muted/20'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <cmd.icon className="h-4 w-4" style={{ color: cmd.color }} />
                      <div>
                        <span className="text-sm font-mono">{cmd.cmd}</span>
                        <span className="text-xs text-muted-foreground ml-2">{cmd.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <motion.div 
                  key={i} 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group"
                >
                  <div className="h-14 w-14 rounded-lg overflow-hidden border border-border/30 bg-muted/10 backdrop-blur">
                    {media.type === 'image' && <img src={media.url} alt="" className="h-full w-full object-cover" />}
                    {media.type === 'video' && (
                      <div className="h-full w-full flex items-center justify-center bg-primary/5">
                        <Video className="h-4 w-4 text-primary/60" />
                      </div>
                    )}
                    {media.type === 'audio' && (
                      <div className="h-full w-full flex items-center justify-center bg-primary/5">
                        <Mic className="h-4 w-4 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveMedia(i)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-destructive-foreground" />
                  </button>
                  <Badge 
                    variant="secondary" 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] px-1 py-0"
                  >
                    {media.type}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main command bar */}
        <div className="flex items-center gap-2">
          {/* Quick upload buttons */}
          <div className="flex items-center gap-0.5 shrink-0 bg-muted/10 rounded-lg p-0.5">
            {[
              { icon: ImageIcon, accept: 'image/*', label: 'Image' },
              { icon: Video, accept: 'video/*', label: 'Video' },
              { icon: Mic, accept: 'audio/*', label: 'Audio' },
            ].map((btn, i) => (
              <Button 
                key={i}
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-md hover:bg-muted/30"
                onClick={() => onOpenFileDialog(btn.accept)}
              >
                <btn.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/20" />

          {/* Spotlight-style input */}
          <motion.div 
            className="flex-1 flex items-center gap-2 bg-muted/5 rounded-xl border border-border/20 px-4 py-2.5 focus-within:border-primary/40 focus-within:bg-muted/10 transition-all"
            animate={isProcessing ? { 
              borderColor: ['hsl(var(--primary) / 0.3)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.3)']
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Command className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <input
              ref={inputRef}
              value={command}
              onChange={(e) => {
                setCommand(e.target.value);
                setShowSuggestions(e.target.value.startsWith('/'));
                setSelectedIndex(0);
              }}
              onFocus={() => command.startsWith('/') && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder="Type / for commands, or describe what you need..."
              className="flex-1 bg-transparent border-0 text-sm placeholder:text-muted-foreground/30 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="text-[9px] text-muted-foreground/40 bg-muted/20 px-1.5 py-0.5 rounded hidden sm:block">⌘K</kbd>
            </div>
          </motion.div>

          {/* Execute button */}
          <Button 
            onClick={onExecute}
            disabled={isProcessing || !isOnline || (!command.trim() && mediaQueue.length === 0)}
            className="h-10 px-5 rounded-xl gap-2 bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span className="text-sm font-medium hidden sm:block">Execute</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
