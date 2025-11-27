import { Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  gesture: string | null;
}

export default function GestureIndicator({ gesture }: Props) {
  if (!gesture) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Gesture</p>
            <p className="text-sm font-semibold text-foreground capitalize">{gesture}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
