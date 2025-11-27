import React from "react";
import { useVideoClip } from "@/hooks/useVideoClip";
import StepVideoPlayer from "@/components/StepVideoPlayer";
import MainNav from "@/components/MainNav";

export default function Steps() {
  const clip = useVideoClip();

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Step Library</h1>
        {clip ? (
          <StepVideoPlayer frames={clip} />
        ) : (
          <div className="text-gray-400">No clips recorded yet.</div>
        )}
      </div>
    </div>
  );
}
