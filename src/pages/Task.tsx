import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Camera,
  ChevronRight,
  Cpu,
  History,
  Mic,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Video,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

const statusToColor: Record<string, string> = {
  idle: "bg-slate-700 text-slate-200",
  processing: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  ready: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  error: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
};

const Task = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [taskName, setTaskName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const {
    systemStatus,
    currentTaskName,
    responseFeed,
    tools,
    emotion,
    instructions,
    timeline,
    warnings,
    overlays,
    modes,
    voiceTone,
    lastError,
    actions,
  } = useFixishConsoleStore();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.warn("Camera access denied", error);
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    actions.refreshOverlays();
  }, [actions]);

  useEffect(() => {
    if (lastError) {
      toast({
        title: "Fixish console",
        description: lastError,
        variant: "destructive",
      });
      actions.clearError();
    }
  }, [lastError, toast, actions]);

  const captureFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], `frame-${Date.now()}.png`, { type: "image/png" });
    await actions.ingestImage(file);
  };

  const handleVisualUpload = async () => {
    if (imageFile) await actions.ingestImage(imageFile);
    if (videoFile) await actions.ingestVideo(videoFile);
  };

  const handleAudioUpload = async () => {
    if (audioFile) await actions.ingestAudio(audioFile);
  };

  const handlePromptSubmit = async () => {
    await actions.submitPrompt(prompt);
    setPrompt("");
  };

  const handleTaskStart = async () => {
    await actions.startTask(taskName || "Untitled Task");
    setTaskName("");
  };

  const handleVoiceNudge = () => {
    const scripted = "Guide me through the next repair step with AR hints.";
    setPrompt(scripted);
  };

  const overlayPreview = overlays[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <canvas ref={canvasRef} className="hidden" aria-hidden />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.5em] uppercase text-slate-400">Fixish AGI Fabric</p>
              <h1 className="text-4xl md:text-5xl font-light mt-2">Task Console</h1>
              <p className="text-sm text-slate-400 mt-1">
                Orchestrate the 100-system stack: perception, reasoning, safety, and overlays.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bg-white/5 border-white/10" onClick={actions.refreshOverlays}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Sync Overlays
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10" asChild>
                <Link to="/history">
                  <History className="mr-2 h-4 w-4" /> Task History
                </Link>
              </Button>
              <Button className="bg-primary" asChild>
                <Link to="/settings-console">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Console Settings
                </Link>
              </Button>
            </div>
          </div>
          <SystemStatusBar status={systemStatus} />
        </header>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <section className="space-y-6">
            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-primary" /> Camera & Sensor Hub
                </CardTitle>
                <CardDescription>Stream live feed or inject captures directly into the vision engine.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative rounded-2xl border border-white/5 overflow-hidden bg-black/40">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/60 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={captureFrame} className="flex-1 min-w-[180px]" variant="secondary">
                    <Camera className="mr-2 h-4 w-4" /> Capture Frame
                  </Button>
                  <Input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="flex-1" />
                  <Input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} className="flex-1" />
                  <Button onClick={handleVisualUpload} disabled={!imageFile && !videoFile}>
                    <Sparkles className="mr-2 h-4 w-4" /> Send to Vision
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Waves className="h-5 w-5 text-rose-400" /> Audio & Emotion Capture
                </CardTitle>
                <CardDescription>Upload operator audio to decode affect and tailor instructions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Input type="file" accept="audio/*" onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)} className="flex-1" />
                  <Button onClick={handleAudioUpload} disabled={!audioFile} variant="secondary">
                    <Play className="mr-2 h-4 w-4" /> Decode Emotion
                  </Button>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Emotional Guidance</p>
                    <p className="text-2xl font-light">{emotion.label}</p>
                    <p className="text-sm text-slate-400">{emotion.guidance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-slate-400">Confidence</p>
                    <p className="text-2xl font-semibold">{emotion.confidence ? Math.round(emotion.confidence * 100) : 72}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Cpu className="h-5 w-5 text-emerald-400" /> AGI Command Deck
                  </CardTitle>
                  <CardDescription>Send multimodal prompts into the orchestrator and stream multi-agent responses.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Mission codename" value={taskName} onChange={(event) => setTaskName(event.target.value)} className="w-48 bg-slate-900/80 border-white/10" />
                  <Button onClick={handleTaskStart}>Start Task</Button>
                  <Button variant="outline" className="border-white/10" onClick={actions.continueTask}>
                    <ArrowRight className="mr-2 h-4 w-4" /> Continue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} placeholder="Describe what Fixish should do next..." className="bg-slate-900/60 border-white/10" />
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Button onClick={handlePromptSubmit} disabled={!prompt.trim()}>
                      <Sparkles className="mr-2 h-4 w-4" /> Run AGI
                    </Button>
                    <Button type="button" variant="ghost" className="text-slate-300" onClick={handleVoiceNudge}>
                      <Mic className="mr-2 h-4 w-4" /> Use voice snippet
                    </Button>
                    <Badge variant="outline" className="border-primary/40 text-primary">{currentTaskName ?? "No task"}</Badge>
                  </div>
                </div>
                <Tabs defaultValue="agents" className="w-full">
                  <TabsList className="bg-slate-900/70">
                    <TabsTrigger value="agents">Multi-Agent Reasoning</TabsTrigger>
                    <TabsTrigger value="instructions">Instruction Feed</TabsTrigger>
                  </TabsList>
                  <TabsContent value="agents">
                    <ScrollArea className="h-56 pr-2">
                      <div className="space-y-3">
                        {responseFeed.length === 0 && (
                          <p className="text-sm text-slate-400">Responses will appear here once the orchestrator streams back reasoning.</p>
                        )}
                        {responseFeed.map((entry) => (
                          <div key={entry.id} className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-slate-50">{entry.agent}</p>
                              <span className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{entry.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="instructions">
                    <ScrollArea className="h-56 pr-2">
                      <ol className="space-y-3">
                        {instructions.length === 0 && <p className="text-sm text-slate-400">Awaiting instructions.</p>}
                        {instructions.map((step, index) => (
                          <li key={index} className="flex gap-3">
                            <Badge variant="secondary" className="bg-white/5 border-white/10">{index + 1}</Badge>
                            <p className="text-sm text-slate-100">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-sky-400" /> Tools Detected
                </CardTitle>
                <CardDescription>Signals surfaced by the Tool Prediction Engine.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tools.length === 0 && <p className="text-sm text-slate-400">No tools recommended yet. Run the orchestrator to populate suggestions.</p>}
                {tools.map((tool) => (
                  <div key={`${tool.name}-${tool.description}`} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium">{tool.name}</p>
                      {typeof tool.confidence === "number" && (
                        <Badge variant="outline" className="border-white/20 text-slate-200">
                          {Math.round(tool.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    {tool.description && <p className="text-sm text-slate-400 mt-2">{tool.description}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ChevronRight className="h-5 w-5 text-emerald-300" /> Task Timeline
                </CardTitle>
                <CardDescription>Past execution trail and predicted future steps.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Past Steps</p>
                  <TimelineList items={timeline.past} color="text-slate-200" />
                </div>
                <Separator className="bg-white/10" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Predicted Steps</p>
                  <TimelineList items={timeline.future} color="text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-300" /> Mistake Warnings & Safety
                </CardTitle>
                <CardDescription>Live notices from Safety + Hazard agents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {warnings.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-400">
                    System steady. No active hazards.
                  </div>
                )}
                {warnings.map((warning, index) => (
                  <div key={index} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                    {warning}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="h-5 w-5 text-purple-300" /> Overlay Preview
                </CardTitle>
                <CardDescription>Projected AR guidance for the operator.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/60 aspect-video flex items-center justify-center">
                  {overlayPreview ? (
                    <img src={overlayPreview} alt="Overlay preview" className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-sm text-slate-500">Overlay preview will appear once the scene has been processed.</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-slate-300" asChild>
                  <Link to="/history">
                    Review overlays <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <ModesCard modes={modes} voiceTone={voiceTone} />
          </aside>
        </div>
      </div>
    </div>
  );
};

const TimelineList = ({ items, color }: { items: string[]; color: string }) => {
  if (!items?.length) {
    return <p className="text-sm text-slate-500 mt-2">No data yet.</p>;
  }

  return (
    <ul className="mt-2 space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-3">
          <span className={cn("mt-1 h-2 w-2 rounded-full", color === "text-primary" ? "bg-primary" : "bg-slate-400")}></span>
          <p className="text-sm text-slate-100">{item}</p>
        </li>
      ))}
    </ul>
  );
};

const ModesCard = ({
  modes,
  voiceTone,
}: {
  modes: { childSafe: boolean; elderMode: boolean; doItWithYou: boolean; offline: boolean };
  voiceTone: "calm" | "technical" | "motivational";
}) => {
  const { actions } = useFixishConsoleStore();

  return (
    <Card className="bg-slate-900/60 border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" /> Modes & Voice
        </CardTitle>
        <CardDescription>Adaptive experiences for different operators.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[
            { key: "childSafe", label: "Child-Safe Mode", description: "Strips advanced tooling and simplifies copy." },
            { key: "elderMode", label: "Elder Mode", description: "Larger text, slower pacing." },
            { key: "doItWithYou", label: "Do-It-With-You", description: "Agent narrates alongside the user." },
            { key: "offline", label: "Offline Mode", description: "UI-only fallback when network drops." },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
              <Switch checked={modes[item.key as keyof typeof modes]} onCheckedChange={(checked) => actions.updateModes({ [item.key]: checked } as any)} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.3em] text-slate-400">Voice assistant tone</Label>
          <div className="grid grid-cols-3 gap-2">
            {["calm", "technical", "motivational"].map((tone) => (
              <Button key={tone} variant={voiceTone === tone ? "default" : "outline"} className={cn("w-full capitalize", voiceTone === tone ? "bg-primary" : "bg-transparent border-white/10 text-slate-300")} onClick={() => actions.setVoiceTone(tone as any)}>
                {tone}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SystemStatusBar = ({
  status,
}: {
  status: { vision: string; emotion: string; tools: string; backend: string };
}) => (
  <div className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
    {Object.entries(status).map(([key, value]) => (
      <div key={key} className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-wide", statusToColor[value] ?? "bg-slate-700 text-slate-100") }>
        <span className="font-semibold">{key}</span>
        <span className="tracking-tight">{value}</span>
      </div>
    ))}
  </div>
);

export default Task;
