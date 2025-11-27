import { useEffect, useRef } from "react";

interface Anchor {
  outline: [number, number, number, number];
  arrow: [number, number, number, number];
  label: string;
}

interface ARCanvasProps {
  frame: string | null;
  anchors: Record<string, Anchor>;
}

export function ARCanvas({ frame, anchors }: ARCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!frame || !canvasRef.current) return;

    const img = new Image();
    img.src = "data:image/jpeg;base64," + frame;

    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      Object.keys(anchors).forEach((id) => {
        const a = anchors[id];
        const [x1, y1, x2, y2] = a.outline;

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const [ax, ay, bx, by] = a.arrow;
        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        ctx.fillStyle = "cyan";
        ctx.font = "20px sans-serif";
        ctx.fillText(a.label, x1, y1 - 10);
      });
    };
  }, [frame, anchors]);

  return <canvas ref={canvasRef} className="rounded-xl shadow-lg" />;
}
