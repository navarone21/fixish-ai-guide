import { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface RepairStepProps {
  number: number;
  title: string;
  content: string;
  image?: string;
  tip?: string;
  defaultOpen?: boolean;
}

export const RepairStep = ({ number, title, content, image, tip, defaultOpen = false }: RepairStepProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isComplete, setIsComplete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: number * 0.1 }}
      className="mb-3"
    >
      <div
        className={`rounded-lg border-2 transition-all ${
          isComplete
            ? "border-green-500 bg-green-500/5"
            : "border-border bg-card"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors rounded-t-lg"
        >
          <Checkbox
            checked={isComplete}
            onCheckedChange={(checked) => setIsComplete(checked as boolean)}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
            {number}
          </div>
          
          <span className="font-semibold flex-1">{title}</span>
          
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-3">
                {image && (
                  <img
                    src={image}
                    alt={title}
                    className="w-full rounded-lg border border-border"
                  />
                )}
                
                <p className="text-sm leading-relaxed">{content}</p>
                
                {tip && (
                  <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <span className="font-semibold">💡 Pro Tip:</span> {tip}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
