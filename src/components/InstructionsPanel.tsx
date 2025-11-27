import { useFixish } from "@/contexts/FixishProvider";
import { AlertCircle } from "lucide-react";

export default function InstructionsPanel() {
  const { instructions } = useFixish();

  if (!instructions) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">
          Current Instructions
        </h3>
      </div>
      <p className="text-foreground leading-relaxed">{instructions}</p>
    </div>
  );
}
