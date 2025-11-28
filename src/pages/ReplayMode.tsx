import React from "react";
import MainNav from "@/components/MainNav";
import { useStepReplay } from "@/hooks/useStepReplay";
import StepReplayGhost from "@/components/StepReplayGhost";

export default function ReplayMode() {
  const replayData = useStepReplay();

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Step Replay Mode</h1>
        <p className="text-muted-foreground mb-6">
          Review and replay repair step animations to learn correct techniques.
        </p>

        <div className="relative w-full h-[calc(100vh-300px)] bg-background/50 border border-border rounded-lg overflow-hidden">
          {replayData && replayData.length > 0 ? (
            <StepReplayGhost replay={replayData} />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center text-muted-foreground p-6">
                <p className="text-xl mb-2">No replay data available</p>
                <p className="text-sm">Complete repair steps in Live Repair mode to generate replays</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
