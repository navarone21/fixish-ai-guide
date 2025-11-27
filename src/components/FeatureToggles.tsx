import { Settings } from "lucide-react";
import { useFeatureStore } from "@/state/featureStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FeatureToggles() {
  const { features, toggleFeature, currentMode, setMode } = useFeatureStore();

  const modeDescriptions = {
    beginner: "Maximum guidance with all helper features enabled",
    expert: "Minimal UI for experienced users",
    minimal: "Bare essentials only, no distractions",
    developer: "All features enabled for debugging and testing",
    ar_heavy: "Focus on AR overlays and visual guidance",
    safety_first: "All safety warnings and troubleshooting enabled",
  };

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
      <PopoverContent className="w-80 bg-card/95 backdrop-blur-sm border-border" align="end">
        <Tabs defaultValue="modes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modes">Modes</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modes" className="space-y-3 mt-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Quick Mode Presets</h3>
            
            {Object.entries(modeDescriptions).map(([mode, description]) => (
              <button
                key={mode}
                onClick={() => setMode(mode)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentMode === mode
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background/50 border-border hover:bg-accent"
                }`}
              >
                <div className="font-medium text-sm capitalize mb-1">
                  {mode.replace('_', '-')} Mode
                </div>
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              </button>
            ))}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-foreground">Individual Features</h3>
              {currentMode === 'custom' && (
                <span className="text-xs text-primary">Custom</span>
              )}
            </div>
            
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
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
