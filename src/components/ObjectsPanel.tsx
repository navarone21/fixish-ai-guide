import { useFixish } from "@/contexts/FixishProvider";

export default function ObjectsPanel() {
  const { objects } = useFixish();

  if (!objects || objects.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 bg-accent/50 backdrop-blur-sm rounded-xl p-4 border border-border max-w-xs">
      <h3 className="text-sm font-semibold text-accent-foreground mb-2">
        Detected Objects
      </h3>
      <div className="flex flex-wrap gap-2">
        {objects.map((obj, idx) => (
          <div 
            key={idx} 
            className="bg-background rounded-lg px-3 py-1 border border-border text-xs text-foreground"
          >
            {obj.label || obj.class || 'Unknown'}
          </div>
        ))}
      </div>
    </div>
  );
}
