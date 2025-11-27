interface GhostRotationArrowProps {
  direction: "cw" | "ccw" | null;
  center: { x: number; y: number } | null;
}

export default function GhostRotationArrow({ direction, center }: GhostRotationArrowProps) {
  if (!center || !direction) return null;

  return (
    <div
      className="absolute pointer-events-none text-blue-400 text-3xl z-50 animate-spin"
      style={{
        left: center.x - 20,
        top: center.y - 20,
        animationDuration: "3s",
      }}
    >
      {direction === "ccw" ? "↺" : "↻"}
    </div>
  );
}
