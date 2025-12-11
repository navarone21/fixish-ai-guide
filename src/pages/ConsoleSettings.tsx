import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

const ConsoleSettings = () => {
  const { modes, voiceTone, systemStatus, actions } = useFixishConsoleStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Console Preferences</p>
            <h1 className="text-4xl font-light mt-2">Assistant Settings</h1>
            <p className="text-sm text-slate-400">Tune the multimodal assistant for kids, elders, shared guidance, or offline fallback.</p>
          </div>
          <Button asChild>
            <Link to="/">Back to Console</Link>
          </Button>
        </header>

        <Card className="bg-slate-900/70 border-white/10">
          <CardHeader>
            <CardTitle>Safety & Guidance Modes</CardTitle>
            <CardDescription>Toggle adaptive experiences layered on top of the orchestrator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "childSafe",
                title: "Child-Safe Mode",
                detail: "Removes advanced tooling, softens language, and slows pacing.",
              },
              {
                key: "elderMode",
                title: "Elder Mode",
                detail: "Increases contrast, uses larger typography, and repeats steps.",
              },
              {
                key: "doItWithYou",
                title: "Do-It-With-You Mode",
                detail: "Narrates side-by-side with the operator and confirms each step.",
              },
              {
                key: "offline",
                title: "Offline Mode (UI only)",
                detail: "Freezes network requests but keeps the console responsive for demos.",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <div>
                  <p className="text-base font-medium">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </div>
                <Switch
                  checked={modes[item.key as keyof typeof modes]}
                  onCheckedChange={(checked) => actions.updateModes({ [item.key]: checked } as any)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-white/10">
          <CardHeader>
            <CardTitle>Voice Assistant Tone</CardTitle>
            <CardDescription>Choose how the voice layer speaks to the operator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-400">Tone preset</Label>
            <Select value={voiceTone} onValueChange={(value) => actions.setVoiceTone(value as any)}>
              <SelectTrigger className="bg-slate-900/70 border-white/10">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-slate-50 border-white/10">
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="motivational">Motivational</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Tone preference is forwarded with every /process/text call so downstream agents stay in sync.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-white/10">
          <CardHeader>
            <CardTitle>System Status Snapshot</CardTitle>
            <CardDescription>Quick look at engine health without leaving settings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div key={key} className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 min-w-[160px]">
                <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{key}</span>
                <span className="text-lg font-semibold text-white">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator className="bg-white/10" />
        <p className="text-xs text-slate-500">Settings apply instantly and are stored in memory for the current session.</p>
      </div>
    </div>
  );
};

export default ConsoleSettings;
