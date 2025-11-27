import React from "react";
import MainNav from "@/components/MainNav";
import { useFixish } from "@/contexts/FixishProvider";

export default function SceneGraphPage() {
  const { sceneGraph } = useFixish();

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Scene Graph</h1>
        {sceneGraph ? (
          <pre className="bg-background/50 border border-border rounded-lg p-4 overflow-auto max-h-[calc(100vh-200px)] text-sm">
            {JSON.stringify(sceneGraph, null, 2)}
          </pre>
        ) : (
          <div className="text-muted-foreground">No scene graph data yet. Start a repair session.</div>
        )}
      </div>
    </div>
  );
}
