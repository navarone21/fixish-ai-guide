import { DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Image, Video, Mic, FileText, Sparkles } from "lucide-react";

interface DropZoneProps {
  isDragging: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
}

export function DropZone({ isDragging, onDragOver, onDragLeave, onDrop }: DropZoneProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-4 z-50 rounded-2xl overflow-hidden"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(180 100% 70%), hsl(var(--primary)))',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[2px] rounded-2xl bg-background/95 backdrop-blur-xl" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="relative mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
            </motion.div>

            <h3 className="text-lg font-semibold text-foreground mb-2">Drop to Upload</h3>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Release to add to the intelligence queue
            </p>

            {/* Supported types */}
            <div className="flex items-center gap-3">
              {[
                { icon: Image, label: 'Images', color: 'hsl(180 100% 60%)' },
                { icon: Video, label: 'Videos', color: 'hsl(200 100% 60%)' },
                { icon: Mic, label: 'Audio', color: 'hsl(280 100% 60%)' },
                { icon: FileText, label: 'Docs', color: 'hsl(40 100% 60%)' },
              ].map((type, i) => (
                <motion.div
                  key={type.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/10 border border-border/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <type.icon className="h-3.5 w-3.5" style={{ color: type.color }} />
                  <span className="text-xs text-muted-foreground">{type.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Auto-routing message */}
            <motion.div
              className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Auto-routed to appropriate subsystem</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
