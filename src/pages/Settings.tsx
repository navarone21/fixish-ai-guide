import React from "react";
import MainNav from "@/components/MainNav";
import { Settings as SettingsIcon, Camera, Mic, Volume2, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function Settings() {
  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <div className="bg-background/50 border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Camera</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-focus" className="text-foreground">Auto Focus</Label>
                <Switch id="auto-focus" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hdr" className="text-foreground">HDR Mode</Label>
                <Switch id="hdr" />
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Voice</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-input" className="text-foreground">Voice Input</Label>
                <Switch id="voice-input" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-coach" className="text-foreground">Voice Coach</Label>
                <Switch id="voice-coach" defaultChecked />
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Audio</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground mb-2 block">Narration Volume</Label>
                <Slider defaultValue={[90]} max={100} step={1} className="w-full" />
              </div>
              <div>
                <Label className="text-foreground mb-2 block">Alert Volume</Label>
                <Slider defaultValue={[100]} max={100} step={1} className="w-full" />
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Appearance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-foreground">Dark Mode</Label>
                <Switch id="dark-mode" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="text-foreground">AR Animations</Label>
                <Switch id="animations" defaultChecked />
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Advanced</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hand-tracking" className="text-foreground">Hand Tracking</Label>
                <Switch id="hand-tracking" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="depth-sensing" className="text-foreground">Depth Sensing</Label>
                <Switch id="depth-sensing" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mesh-reconstruction" className="text-foreground">3D Mesh Reconstruction</Label>
                <Switch id="mesh-reconstruction" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
