import React, { useEffect, useState } from "react";

interface StepVideoPlayerProps {
  frames: string[];
}

export default function StepVideoPlayer({ frames }: StepVideoPlayerProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!frames || frames.length === 0) return;

    setIdx(0);
    let i = 0;

    const timer = setInterval(() => {
      i++;
      if (i >= frames.length) {
        clearInterval(timer);
        return;
      }
      setIdx(i);
    }, 40); // 25fps

    return () => clearInterval(timer);
  }, [frames]);

  if (!frames || frames.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 w-48 h-48 border-2 border-white rounded-xl overflow-hidden shadow-xl bg-black/80 z-50">
      <img
        src={`data:image/jpeg;base64,${frames[idx]}`}
        alt="Step video frame"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
