import React from "react";
import MainNav from "@/components/MainNav";
import PointCloudViewer from "@/components/PointCloudViewer";
import { useFixish } from "@/contexts/FixishProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DepthVision() {
  const { meshPoints } = useFixish();

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Depth Vision</h1>
        <p className="text-muted-foreground mb-6">
          View 3D point cloud visualization of your repair environment.
        </p>

        <div className="relative w-full h-[calc(100vh-250px)] bg-background/50 border border-border rounded-lg overflow-hidden">
          {meshPoints && Array.isArray(meshPoints) && meshPoints.length > 0 ? (
            <PointCloudViewer points={meshPoints} />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center text-muted-foreground p-6">
                <p className="text-xl mb-2">No point cloud data available</p>
                <p className="text-sm">Start a repair session to generate 3D visualization</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
