import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Coordinates {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  x?: number;
  y?: number;
}

interface Overlay {
  type: "box" | "arrow" | "highlight" | "twist" | "danger_zone" | "label";
  coordinates?: Coordinates;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: any;
  direction?: string;
  angle?: number;
  severity?: number;
  text?: string;
}

interface OverlayCanvasProps {
  baseImage: string;
  overlays: Overlay[];
}

export function OverlayCanvas({ baseImage, overlays }: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      const { naturalWidth, naturalHeight } = img;
      const { width, height } = img.getBoundingClientRect();
      setDimensions({ width, height });
      setImageLoaded(true);
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
      return () => img.removeEventListener("load", handleLoad);
    }
  }, [baseImage]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const { naturalWidth, naturalHeight } = img;
    const { width, height } = dimensions;

    const scaleX = width / naturalWidth;
    const scaleY = height / naturalHeight;

    canvas.width = width;
    canvas.height = height;

    let animationTime = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      animationTime += 0.05;

      overlays.forEach((overlay) => {
        switch (overlay.type) {
          case "box":
            drawBox(ctx, overlay, scaleX, scaleY);
            break;
          case "arrow":
            drawArrow(ctx, overlay, scaleX, scaleY);
            break;
          case "highlight":
            drawHighlight(ctx, overlay, scaleX, scaleY);
            break;
          case "twist":
            drawTwist(ctx, overlay, scaleX, scaleY, animationTime);
            break;
          case "danger_zone":
            drawDangerZone(ctx, overlay, scaleX, scaleY, animationTime);
            break;
          case "label":
            drawLabel(ctx, overlay, scaleX, scaleY);
            break;
        }
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [imageLoaded, overlays, dimensions]);

  const drawBox = (
    ctx: CanvasRenderingContext2D,
    overlay: Overlay,
    scaleX: number,
    scaleY: number
  ) => {
    if (!overlay.coordinates) return;
    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = overlay.coordinates;

    ctx.strokeStyle = "#00d9ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00d9ff";
    ctx.shadowBlur = 10;

    ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);

    ctx.shadowBlur = 0;
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    overlay: Overlay,
    scaleX: number,
    scaleY: number
  ) => {
    if (!overlay.start || !overlay.end) return;

    const startX = overlay.start.x * scaleX;
    const startY = overlay.start.y * scaleY;
    const endX = overlay.end.x * scaleX;
    const endY = overlay.end.y * scaleY;

    ctx.strokeStyle = "#00ff88";
    ctx.fillStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 15;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  };

  const drawHighlight = (
    ctx: CanvasRenderingContext2D,
    overlay: Overlay,
    scaleX: number,
    scaleY: number
  ) => {
    if (!overlay.coordinates) return;
    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = overlay.coordinates;

    ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
    ctx.shadowColor = "rgba(255, 255, 0, 0.6)";
    ctx.shadowBlur = 20;

    ctx.fillRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);

    ctx.shadowBlur = 0;
  };

  const drawTwist = (
    ctx: CanvasRenderingContext2D,
    overlay: Overlay,
    scaleX: number,
    scaleY: number,
    time: number
  ) => {
    if (!overlay.coordinates) return;
    const { x1 = 0, y1 = 0 } = overlay.coordinates;

    const centerX = x1 * scaleX;
    const centerY = y1 * scaleY;
    const radius = 30;

    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 10;

    const startAngle = time;
    const endAngle = startAngle + Math.PI * 1.5;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();

    const arrowX = centerX + radius * Math.cos(endAngle);
    const arrowY = centerY + radius * Math.sin(endAngle);
    const arrowAngle = endAngle + Math.PI / 2;

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX + 10 * Math.cos(arrowAngle - Math.PI / 6),
      arrowY + 10 * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
      arrowX + 10 * Math.cos(arrowAngle + Math.PI / 6),
      arrowY + 10 * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  };

  const drawDangerZone = (
    ctx: CanvasRenderingContext2D,
    overlay: Overlay,
    scaleX: number,
    scaleY: number,
    time: number
  ) => {
    if (!overlay.coordinates) return;
    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = overlay.coordinates;
    const severity = overlay.severity || 5;

    let color = "#ff9500";
    if (severity >= 8) {
      color = "#ff0000";
      const pulse = Math.sin(time * 2) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
    } else if (severity >= 5) {
      color = "#ff0000";
    }

    ctx.strokeStyle = color;
    ctx.fillStyle = `${color}33`;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = severity >= 8 ? 20 : 15;

    ctx.fillRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);
    ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  const drawLabel = (
    ctx: CanvasRenderingContext2D,
    overlay: Overlay,
    scaleX: number,
    scaleY: number
  ) => {
    if (!overlay.coordinates || !overlay.text) return;
    const { x = 0, y = 0 } = overlay.coordinates;

    const text = overlay.text;
    ctx.font = "bold 14px sans-serif";
    const metrics = ctx.measureText(text);
    const padding = 8;
    const width = metrics.width + padding * 2;
    const height = 24;

    const labelX = x * scaleX;
    const labelY = y * scaleY;

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(labelX - width / 2, labelY - height / 2, width, height, 12);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, labelX, labelY);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <img
        ref={imgRef}
        src={baseImage}
        alt="Analysis"
        className="w-full h-auto rounded-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </motion.div>
  );
}
