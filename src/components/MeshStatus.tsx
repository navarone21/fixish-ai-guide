import { useFixish } from "@/contexts/FixishProvider";
import { Box, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function MeshStatus() {
  const { meshPoints, mesh } = useFixish();

  if (!meshPoints) return null;

  // Estimate progress (assume 10000 points is "complete")
  const maxPoints = 10000;
  const progress = Math.min((meshPoints / maxPoints) * 100, 100);

  return (
    <div className="bg-accent/50 rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="w-5 h-5 text-accent-foreground" />
        <h3 className="text-lg font-semibold text-accent-foreground">
          3D Mesh Reconstruction
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Points Collected</span>
          <span className="font-mono font-semibold text-accent-foreground">
            {meshPoints.toLocaleString()}
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Box className="w-4 h-4" />
          <span>
            {mesh ? "Mesh ready for visualization" : "Collecting spatial data..."}
          </span>
        </div>
      </div>
    </div>
  );
}
