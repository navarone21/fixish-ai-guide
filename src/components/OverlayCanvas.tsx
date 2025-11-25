import React, { useEffect, useRef } from "react";

interface Detection {
  label: string;
  confidence: number;
  box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface OverlayCanvasProps {
  imageSrc: string;
  detections?: Detection[];
}

export default function OverlayCanvas({ imageSrc, detections }: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      // Set canvas size to match image
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw image
      ctx.drawImage(image, 0, 0);

      // Draw detection overlays
      detections?.forEach((det) => {
        const { label, confidence, box } = det;

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          box.x1,
          box.y1,
          box.x2 - box.x1,
          box.y2 - box.y1
        );

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(box.x1, box.y1 - 25, 140, 25);

        ctx.fillStyle = "lime";
        ctx.font = "18px Arial";
        ctx.fillText(
          `${label} ${(confidence * 100).toFixed(1)}%`,
          box.x1 + 5,
          box.y1 - 8
        );
      });
    };
  }, [imageSrc, detections]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: "100%",
        border: "1px solid #333",
        borderRadius: "8px",
      }}
    />
  );
}
