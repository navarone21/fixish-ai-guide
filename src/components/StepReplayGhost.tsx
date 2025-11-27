import React, { useEffect, useState } from "react";

interface ReplayFrame {
  center: {
    x: number;
    y: number;
  };
}

interface StepReplayGhostProps {
  replay: ReplayFrame[];
}

export default function StepReplayGhost({ replay }: StepReplayGhostProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!replay || replay.length === 0) return;

    setFrame(0);
    let i = 0;

    const timer = setInterval(() => {
      i++;
      if (i >= replay.length) {
        clearInterval(timer);
        return;
      }
      setFrame(i);
    }, 40); // 25fps

    return () => clearInterval(timer);
  }, [replay]);

  if (!replay?.length) return null;

  const f = replay[frame];
  if (!f) return null;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: f.center.x - 15,
        top: f.center.y - 15,
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: "rgba(0, 150, 255, 0.5)",
        boxShadow: "0 0 20px rgba(0,150,255,0.8)",
        transition: "all 0.04s linear",
      }}
    />
  );
}
