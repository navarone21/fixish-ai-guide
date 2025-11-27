import { Settings } from "lucide-react";
import { useFeatureStore } from "@/state/featureStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function FeatureToggles() {
  const { features, toggleFeature } = useFeatureStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-card/95 backdrop-blur-sm border-border" align="end">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Feature Toggles</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="depth" className="text-sm text-foreground">Depth Maps</Label>
              <Switch
                id="depth"
                checked={features.depth}
                onCheckedChange={() => toggleFeature('depth')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mesh" className="text-sm text-foreground">3D Mesh</Label>
              <Switch
                id="mesh"
                checked={features.mesh}
                onCheckedChange={() => toggleFeature('mesh')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ghostReplay" className="text-sm text-foreground">Step Replay</Label>
              <Switch
                id="ghostReplay"
                checked={features.ghostReplay}
                onCheckedChange={() => toggleFeature('ghostReplay')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="troubleshooting" className="text-sm text-foreground">Troubleshooting</Label>
              <Switch
                id="troubleshooting"
                checked={features.troubleshooting}
                onCheckedChange={() => toggleFeature('troubleshooting')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="stepClips" className="text-sm text-foreground">Video Clips</Label>
              <Switch
                id="stepClips"
                checked={features.stepClips}
                onCheckedChange={() => toggleFeature('stepClips')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sceneGraph" className="text-sm text-foreground">Scene Graph</Label>
              <Switch
                id="sceneGraph"
                checked={features.sceneGraph}
                onCheckedChange={() => toggleFeature('sceneGraph')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gestureControl" className="text-sm text-foreground">Gesture Control</Label>
              <Switch
                id="gestureControl"
                checked={features.gestureControl}
                onCheckedChange={() => toggleFeature('gestureControl')}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
