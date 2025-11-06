import { AlertTriangle, Shield, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface SafetyWarningProps {
  level: "critical" | "warning" | "info";
  message: string;
  details?: string;
}

export const SafetyWarning = ({ level, message, details }: SafetyWarningProps) => {
  const config = {
    critical: {
      icon: AlertTriangle,
      colors: "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
      iconColor: "text-red-600 dark:text-red-400",
    },
    warning: {
      icon: Shield,
      colors: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    info: {
      icon: Info,
      colors: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  };

  const { icon: Icon, colors, iconColor } = config[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4"
    >
      <Alert className={`${colors} border-2`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <AlertTitle className="font-bold">
          {level === "critical" ? "⚠️ CRITICAL SAFETY WARNING" : level === "warning" ? "Safety Notice" : "Safety Tip"}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="font-semibold">{message}</p>
          {details && <p className="mt-2 text-sm opacity-90">{details}</p>}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};
