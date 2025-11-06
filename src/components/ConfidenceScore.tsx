import { Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ConfidenceScoreProps {
  score: number;
  reasoning?: string;
}

export const ConfidenceScore = ({ score, reasoning }: ConfidenceScoreProps) => {
  const percentage = Math.round(score * 100);
  
  const getColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getLabel = () => {
    if (percentage >= 80) return "High Confidence";
    if (percentage >= 60) return "Moderate Confidence";
    return "Lower Confidence - Verify Steps";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Brain className={`h-4 w-4 ${getColor()}`} />
        <span className={`text-sm font-semibold ${getColor()}`}>
          {getLabel()}
        </span>
        <span className="ml-auto text-lg font-bold">{percentage}%</span>
      </div>
      
      <Progress value={percentage} className="h-2 mb-2" />
      
      {reasoning && (
        <p className="text-xs text-muted-foreground mt-2">
          <span className="font-medium">Analysis:</span> {reasoning}
        </p>
      )}
    </motion.div>
  );
};
