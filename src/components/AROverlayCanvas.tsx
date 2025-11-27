import { useEffect, useRef } from "react";

interface Props {
  world: any;
  width: number;
  height: number;
}

export default function AROverlayCanvas({ world, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!world) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // -------------------------------
    // DRAW BOUNDING BOXES
    // -------------------------------
    const objects = world?.objects || [];

    objects.forEach((obj: any) => {
      const [x, y, w, h] = obj.bbox;

      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "rgba(0, 255, 120, 0.8)";
      ctx.font = "14px Inter";
      ctx.fillText(`${obj.name} (${Math.round(obj.confidence * 100)}%)`, x + 4, y - 6);
    });

    // -------------------------------
    // HIGHLIGHT ACTIVE TARGET
    // -------------------------------
    if (world?.task_state?.active_target) {
      const target = world.task_state.active_target; // bbox of targeted object
      const [x, y, w, h] = target;

      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      ctx.beginPath();
      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 2;
      ctx.arc(x + w / 2, y + h / 2, w * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // -------------------------------
    // DEPTH HEATMAP (optional)
    // -------------------------------
    if (world?.depth_heatmap) {
      const heat = world.depth_heatmap;
      heat.forEach((point: any) => {
        ctx.fillStyle = point.color;
        ctx.fillRect(point.x, point.y, 2, 2);
      });
    }

  }, [world, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 22 }}
    />
  );
}
