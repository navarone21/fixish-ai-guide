import React, { useEffect, useState } from "react";
import MainNav from "@/components/MainNav";
import { useFixish } from "@/contexts/FixishProvider";
import { Activity, Wifi, Camera, Cpu } from "lucide-react";

export default function Diagnostics() {
  const { worldState, sessionId } = useFixish();
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    let lastTime = Date.now();
    let frames = 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      setFps(Math.round(frames / delta));
      frames = 0;
      lastTime = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (worldState) {
      setFrameCount((prev) => prev + 1);
    }
  }, [worldState]);

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Diagnostics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Wifi className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Connection</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session ID</span>
                <span className="font-mono text-xs">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-400">Connected</span>
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Performance</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">FPS</span>
                <span className="font-mono">{fps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frames Received</span>
                <span className="font-mono">{frameCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Camera</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Backend</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Objects Detected</span>
                <span className="font-mono">{worldState?.objects?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mesh Points</span>
                <span className="font-mono">{worldState?.mesh_points || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {worldState && (
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">World State</h3>
            <pre className="overflow-auto max-h-96 text-xs">
              {JSON.stringify(worldState, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
