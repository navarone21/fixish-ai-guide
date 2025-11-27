import React, { useMemo, useState, useEffect } from "react";
import { useOcclusionMask } from "@/hooks/useOcclusionMask";

interface Props {
  target: { x: number; y: number; w: number; h: number } | null;
}

// Helper function to convert 2D mask array to base64 PNG
function convertMaskToPNG(mask: number[][]): string {
  if (!mask || mask.length === 0) return "";
  
  const height = mask.length;
  const width = mask[0].length;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return "";
  
  // Create image data
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  // Fill with mask values (white = visible, black = occluded)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const value = mask[y][x] * 255;
      data[idx] = 255;     // R
      data[idx + 1] = 255; // G
      data[idx + 2] = 255; // B
      data[idx + 3] = value; // A (opacity from mask)
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png').split(',')[1];
}

export default function StepGuidanceOverlay({ target }: Props) {
  const [prev, setPrev] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const occlusionMask = useOcclusionMask();

  const smoothed = useMemo(() => {
    if (!target) return null;

    return {
      x: prev.x * 0.7 + target.x * 0.3,
      y: prev.y * 0.7 + target.y * 0.3,
      w: prev.w * 0.7 + target.w * 0.3,
      h: prev.h * 0.7 + target.h * 0.3,
    };
  }, [target, prev]);

  useEffect(() => {
    if (smoothed) {
      setPrev(smoothed);
    }
  }, [smoothed]);

  if (!smoothed) return null;

  const { x, y, w, h } = smoothed;
  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <>
      {/* Pulsing circle with occlusion mask */}
      <div
        className="absolute rounded-full border-4 border-blue-400 animate-pulse pointer-events-none"
        style={{
          width: w * 1.2,
          height: h * 1.2,
          left: cx - (w * 1.2) / 2,
          top: cy - (h * 1.2) / 2,
          zIndex: 40,
          maskImage: occlusionMask
            ? `url('data:image/png;base64,${convertMaskToPNG(occlusionMask)}')`
            : "none",
          WebkitMaskImage: occlusionMask
            ? `url('data:image/png;base64,${convertMaskToPNG(occlusionMask)}')`
            : "none",
        }}
      />

      {/* Arrow */}
      <div
        className="absolute text-blue-400 font-bold pointer-events-none"
        style={{
          fontSize: 40,
          left: cx - 20,
          top: y - 50,
          zIndex: 40,
          animation: "bounce 1s infinite"
        }}
      >
        ↓
      </div>
    </>
  );
}
