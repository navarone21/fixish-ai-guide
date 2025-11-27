import { Network } from "lucide-react";

interface Props {
  scene: any;
}

export default function SceneGraphPanel({ scene }: Props) {
  if (!scene) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Network className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold text-foreground">Scene Graph</h3>
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        {scene.nodes && scene.nodes.length > 0 ? (
          scene.nodes.map((node: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span className="text-foreground">{node.label || node.id || `Node ${idx + 1}`}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No scene data</p>
        )}
      </div>
    </div>
  );
}
