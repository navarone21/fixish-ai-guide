import React from "react";

interface Props {
  target: { x: number; y: number; w: number; h: number } | null;
}

export default function StepGuidanceOverlay({ target }: Props) {
  if (!target) return null;

  const { x, y, w, h } = target;
  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <>
      {/* Pulsing circle */}
      <div
        className="absolute rounded-full border-4 border-blue-400 animate-pulse pointer-events-none"
        style={{
          width: w * 1.2,
          height: h * 1.2,
          left: cx - (w * 1.2) / 2,
          top: cy - (h * 1.2) / 2,
          zIndex: 40,
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
