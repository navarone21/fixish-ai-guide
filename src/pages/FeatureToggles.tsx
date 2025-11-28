import React from "react";
import MainNav from "@/components/MainNav";
import FeatureTogglePanel from "@/components/FeatureTogglePanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeatureToggles() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Feature Controls</h1>
        <p className="text-muted-foreground mb-6">
          Enable or disable specific Fix-ISH features to customize your repair workflow.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/50 border-border">
            <CardHeader>
              <CardTitle>Toggle Features</CardTitle>
              <CardDescription>Click to enable/disable individual features</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureTogglePanel />
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border">
            <CardHeader>
              <CardTitle>Feature Descriptions</CardTitle>
              <CardDescription>What each feature does</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Object Detection</h4>
                <p className="text-sm text-muted-foreground">Identifies tools, parts, and objects in camera view</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Depth Analysis</h4>
                <p className="text-sm text-muted-foreground">Captures depth maps for 3D understanding</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Point Cloud</h4>
                <p className="text-sm text-muted-foreground">Generates 3D point cloud from depth data</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">3D Mesh</h4>
                <p className="text-sm text-muted-foreground">Reconstructs full 3D mesh of environment</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">AR Overlay</h4>
                <p className="text-sm text-muted-foreground">Shows visual guidance overlays on camera feed</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Step Replay</h4>
                <p className="text-sm text-muted-foreground">Records and replays repair step animations</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Voice Instructions</h4>
                <p className="text-sm text-muted-foreground">Text-to-speech narration of repair guidance</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Beginner Mode</h4>
                <p className="text-sm text-muted-foreground">Extra guidance and detailed explanations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
