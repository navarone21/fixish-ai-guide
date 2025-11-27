import React, { useMemo, useState, useEffect } from "react";
import { useOcclusionMask } from "@/hooks/useOcclusionMask";
import { convertMaskToPNG } from "@/utils/maskToPNG";

interface Props {
  target: { x: number; y: number; w: number; h: number } | null;
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
