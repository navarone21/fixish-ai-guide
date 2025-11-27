import { useFixish } from "@/contexts/FixishProvider";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepsPanel() {
  const { taskState } = useFixish();

  if (!taskState?.steps) return null;

  const currentStep = taskState.current_step ?? 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-xl font-semibold text-card-foreground mb-6">
        Repair Steps
      </h3>
      <div className="space-y-4">
        {taskState.steps.map((step: any, idx: number) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isUpcoming = idx > currentStep;

          return (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg transition-all",
                isCurrent && "bg-primary/10 border border-primary/30",
                isCompleted && "bg-muted/50",
                isUpcoming && "opacity-60"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted && (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                )}
                {isCurrent && (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                )}
                {isUpcoming && (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      isCurrent && "bg-primary text-primary-foreground",
                      isCompleted && "bg-muted text-muted-foreground",
                      isUpcoming && "bg-muted text-muted-foreground"
                    )}
                  >
                    Step {idx + 1}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    isCurrent && "text-foreground font-medium",
                    isCompleted && "text-muted-foreground line-through",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
