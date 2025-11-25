import React, { useEffect, useRef } from "react";

export default function OverlayCanvas({ imageSrc, detections }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

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
