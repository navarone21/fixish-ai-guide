import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Command, X, Eye, Wrench, Cpu, Shield, Clock, 
  Layers, ScanLine, FileText, Mic, Image, Video, 
  Keyboard, Zap, ArrowUp
} from "lucide-react";

const shortcuts = [
  { keys: ['⌘', 'K'], action: 'Open command bar', icon: Command, category: 'Navigation' },
  { keys: ['⌘', 'Enter'], action: 'Execute command', icon: Zap, category: 'Navigation' },
  { keys: ['Esc'], action: 'Close panels', icon: X, category: 'Navigation' },
  { keys: ['⌘', 'U'], action: 'Upload files', icon: ArrowUp, category: 'Actions' },
  { keys: ['⌘', 'I'], action: 'Upload image', icon: Image, category: 'Actions' },
  { keys: ['⌘', 'V'], action: 'Upload video', icon: Video, category: 'Actions' },
  { keys: ['⌘', 'M'], action: 'Upload audio', icon: Mic, category: 'Actions' },
];

const commands = [
  { cmd: '/vision', description: 'Analyze image or video', icon: Eye, color: 'hsl(180 100% 60%)' },
  { cmd: '/analyze', description: 'Deep AGI analysis', icon: Zap, color: 'hsl(var(--primary))' },
  { cmd: '/repair', description: 'Generate repair steps', icon: Wrench, color: 'hsl(30 100% 60%)' },
  { cmd: '/tools', description: 'Predict required tools', icon: Wrench, color: 'hsl(40 100% 60%)' },
  { cmd: '/steps', description: 'Step-by-step breakdown', icon: Layers, color: 'hsl(200 100% 60%)' },
  { cmd: '/memory', description: 'Access memory system', icon: Cpu, color: 'hsl(140 100% 50%)' },
  { cmd: '/future', description: 'Predict future states', icon: Clock, color: 'hsl(280 100% 60%)' },
  { cmd: '/safety', description: 'Safety analysis', icon: Shield, color: 'hsl(0 80% 60%)' },
  { cmd: '/ar', description: 'Start AR mode', icon: ScanLine, color: 'hsl(260 100% 65%)' },
  { cmd: '/document', description: 'Analyze document', icon: FileText, color: 'hsl(50 100% 60%)' },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand?: (cmd: string) => void;
}

export function KeyboardShortcuts({ isOpen, onClose, onSelectCommand }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[600px] max-h-[80vh] overflow-y-auto z-50 bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border/20 bg-card/95 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Keyboard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
                  <p className="text-[10px] text-muted-foreground">Quick actions & commands</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-muted/20 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Keyboard Shortcuts Section */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-3">Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shortcuts.map((shortcut, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/5 border border-border/10"
                    >
                      <shortcut.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground/80 flex-1">{shortcut.action}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <kbd
                            key={j}
                            className="h-5 min-w-[20px] px-1.5 text-[10px] font-mono bg-muted/20 rounded flex items-center justify-center text-muted-foreground"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Commands Section */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-3">AGI Commands</h3>
                <div className="grid grid-cols-2 gap-2">
                  {commands.map((cmd, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 + 0.2 }}
                      onClick={() => {
                        onSelectCommand?.(cmd.cmd + ' ');
                        onClose();
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/5 border border-border/10 hover:bg-muted/10 hover:border-primary/20 transition-all text-left group"
                    >
                      <div 
                        className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cmd.color}15` }}
                      >
                        <cmd.icon className="h-3.5 w-3.5" style={{ color: cmd.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono block" style={{ color: cmd.color }}>{cmd.cmd}</span>
                        <span className="text-[10px] text-muted-foreground truncate block">{cmd.description}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/20 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-muted/20 rounded text-[9px] font-mono">Esc</kbd>
              <span>to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}