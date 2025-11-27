import React from "react";
import MainNav from "@/components/MainNav";
import MeshOverlay from "@/components/MeshOverlay";
import { useMesh } from "@/hooks/useMesh";

export default function MeshViewerPage() {
  const mesh = useMesh();

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="relative w-full h-full">
        {mesh ? (
          <MeshOverlay mesh={mesh} />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-muted-foreground p-6">
              <p className="text-xl mb-2">No mesh data yet</p>
              <p className="text-sm">Start a repair session to generate 3D mesh reconstruction</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
