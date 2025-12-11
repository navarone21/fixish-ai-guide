import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AudioWaveform,
  Brain,
  CircuitBoard,
  Image as ImageIcon,
  Loader2,
  MemoryStick,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  processFrame,
  uploadImage,
  uploadAudio,
  predictTools,
  getFuture,
} from "@/api";

interface ToolRecommendation {
  name: string;
  reason?: string;
  confidence?: number;
}

interface FutureMemoryInsights {
  predictions: string[];
  continuity: string[];
}

const defaultFuture: FutureMemoryInsights = {
  predictions: [],
  continuity: [],
};

const panelGlow =
  "bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/70 border border-white/10 shadow-[0_0_60px_rgba(15,23,42,0.45)]";

const Task = () => {
  const { toast } = useToast();
  const [taskContext, setTaskContext] = useState("Describe the task you want Fixish to orchestrate...");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInsights, setImageInsights] = useState("Awaiting an uploaded frame.");
  const [imageToken, setImageToken] = useState<string | undefined>();
  const [imageLoading, setImageLoading] = useState(false);

  const [emotionLabel, setEmotionLabel] = useState("No audio analyzed yet.");
  const [emotionMeta, setEmotionMeta] = useState<{ confidence?: number; raw?: any } | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const [instructionOutput, setInstructionOutput] = useState("Run AGI to generate the next move.");
  const [agiLoading, setAgiLoading] = useState(false);

  const [tools, setTools] = useState<ToolRecommendation[]>([]);
  const [toolLoading, setToolLoading] = useState(false);

  const [futureInsights, setFutureInsights] = useState<FutureMemoryInsights>(defaultFuture);
  const [futureLoading, setFutureLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageSelect = (file?: File) => {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(url);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({
        title: "No image detected",
        description: "Upload a frame before pinging the vision engine.",
        variant: "destructive",
      });
      return;
    }

    try {
      setImageLoading(true);
      const response = await uploadImage(imageFile);
      setImageInsights(
        response?.summary ||
          response?.analysis ||
          response?.instruction ||
          JSON.stringify(response, null, 2)
      );
      if (response?.id || response?.image_id) {
        setImageToken(response.id ?? response.image_id);
      }
      toast({
        title: "Vision uplink ready",
        description: "Frame shared with Fixish vision cluster.",
      });
    } catch (error: any) {
      toast({
        title: "Image upload failed",
        description: error?.message || "Vision engine rejected the frame.",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  const handleAudioUpload = async () => {
    if (!audioFile) {
      toast({
        title: "No audio",
        description: "Attach an audio clip for emotion detection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAudioLoading(true);
      const response = await uploadAudio(audioFile);
      const label =
        response?.emotion ||
        response?.state ||
        response?.label ||
        response?.analysis ||
        "Emotion signal captured.";
      setEmotionLabel(label);
      setEmotionMeta({
        confidence: response?.confidence ?? response?.score,
        raw: response,
      });
      toast({
        title: "Emotion decoded",
        description: `Detected ${label}`,
      });
    } catch (error: any) {
      toast({
        title: "Audio upload failed",
        description: error?.message || "Emotion engine is unavailable.",
        variant: "destructive",
      });
    } finally {
      setAudioLoading(false);
    }
  };

  const handleRunAGI = async () => {
    try {
      setAgiLoading(true);
      const payload = {
        context: taskContext,
        vision_summary: imageInsights,
        image_token: imageToken,
        emotion: emotionLabel,
        confidence: emotionMeta?.confidence,
      };
      const response = await processFrame(payload);
      const instruction =
        response?.instruction ||
        response?.generated_instruction ||
        response?.next_step ||
        response?.message ||
        JSON.stringify(response, null, 2);
      setInstructionOutput(instruction);
      toast({
        title: "AGI orchestration complete",
        description: "Instruction channel updated.",
      });
    } catch (error: any) {
      toast({
        title: "AGI run failed",
        description: error?.message || "Backend rejected the payload.",
        variant: "destructive",
      });
    } finally {
      setAgiLoading(false);
    }
  };

  const handlePredictTools = async () => {
    try {
      setToolLoading(true);
      const response = await predictTools({
        context: taskContext,
        instruction: instructionOutput,
      });
      const rawTools: ToolRecommendation[] = Array.isArray(response?.tools)
        ? response.tools
        : response?.recommendations ?? [];
      const normalized = rawTools.map((tool) =>
        typeof tool === "string"
          ? { name: tool }
          : {
              name: tool?.name || tool?.tool || "Unlabeled tool",
              reason: tool?.reason || tool?.why,
              confidence: tool?.confidence ?? tool?.score,
            }
      );
      setTools(normalized);
      toast({
        title: "Tool graph ready",
        description: "Next-step tools predicted.",
      });
    } catch (error: any) {
      toast({
        title: "Tool prediction failed",
        description: error?.message || "Tool engine offline.",
        variant: "destructive",
      });
    } finally {
      setToolLoading(false);
    }
  };

  const handleFutureMemory = async () => {
    try {
      setFutureLoading(true);
      const response = await getFuture({
        context: taskContext,
        latest_instruction: instructionOutput,
      });
      const predictions =
        response?.predictions ||
        response?.memory_predictions ||
        response?.next_cycles ||
        [];
      const continuity =
        response?.continuity ||
        response?.suggestions ||
        response?.long_term ||
        [];
      setFutureInsights({
        predictions: Array.isArray(predictions) ? predictions : [String(predictions)],
        continuity: Array.isArray(continuity) ? continuity : [String(continuity)],
      });
      toast({
        title: "Future memory synced",
        description: "Continuity channel refreshed.",
      });
    } catch (error: any) {
      toast({
        title: "Future memory failed",
        description: error?.message || "Memory cluster unreachable.",
        variant: "destructive",
      });
    } finally {
      setFutureLoading(false);
    }
  };

  const emotionConfidence = useMemo(() => {
    if (!emotionMeta?.confidence) return null;
    return Math.round(emotionMeta.confidence * 100);
  }, [emotionMeta]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-4 text-center">
          <Badge variant="outline" className="border-primary/50 text-primary tracking-[0.3em] uppercase">
            Fixish Internal Suite
          </Badge>
          <h1 className="text-4xl md:text-5xl font-light">
            Fixish AGI Task Console
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto">
            Coordinate the 100-system Fixish stack: upload perception signals, run AGI orchestration,
            read tool trajectories, and lock in future memory — all without touching the public landing page.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className={cn(panelGlow, "relative overflow-hidden")}> 
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Image Upload Panel
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Upload a frame, preview it, and let the Fixish vision engine interpret the scene.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm uppercase tracking-wide text-slate-400">Upload an image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageSelect(event.target.files?.[0] ?? undefined)}
                      className="bg-slate-900/60 border-white/10"
                    />
                  </label>
                  <Button
                    onClick={handleImageUpload}
                    disabled={!imageFile || imageLoading}
                    className="self-end bg-primary hover:bg-primary/90"
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending to /upload_image
                      </>
                    ) : (
                      <>
                        <UploadIcon />
                        Analyze Frame
                      </>
                    )}
                  </Button>
                </div>
                {imagePreview && (
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                      Preview
                    </p>
                    <img
                      src={imagePreview}
                      alt="Uploaded frame"
                      className="rounded-lg border border-white/5"
                    />
                  </div>
                )}
                <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Vision summary
                  </p>
                  <ScrollArea className="h-32 pr-2">
                    <p className="text-sm text-slate-100 whitespace-pre-wrap">
                      {imageInsights}
                    </p>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Card className={panelGlow}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <AudioWaveform className="h-5 w-5 text-rose-400" />
                  Audio Upload Panel
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Detect emotional tone to steer coaching style and safety posture.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm uppercase tracking-wide text-slate-400">Upload audio</span>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
                      className="bg-slate-900/60 border-white/10"
                    />
                  </label>
                  <Button
                    onClick={handleAudioUpload}
                    disabled={!audioFile || audioLoading}
                    className="self-end bg-rose-500 hover:bg-rose-500/90"
                  >
                    {audioLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending to /upload_audio
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Decode Emotion
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/10 text-white">
                      Emotion Spectrum
                    </Badge>
                    {emotionConfidence !== null && (
                      <span className="text-xs text-slate-300">
                        {emotionConfidence}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-light text-slate-50">{emotionLabel}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={panelGlow}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <CircuitBoard className="h-5 w-5 text-emerald-400" />
                  AGI Execution Panel
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Send the full payload to /process and stream back Fixish instruction chains.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm uppercase tracking-wide text-slate-400">Task Context</span>
                  <Textarea
                    value={taskContext}
                    onChange={(event) => setTaskContext(event.target.value)}
                    rows={5}
                    className="bg-slate-900/60 border-white/10"
                  />
                </label>
                <Button
                  size="lg"
                  onClick={handleRunAGI}
                  disabled={agiLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-500/90"
                >
                  {agiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running AGI orchestration
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Run AGI
                    </>
                  )}
                </Button>
                <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Generated instruction
                  </p>
                  <ScrollArea className="h-32 pr-2">
                    <p className="text-sm text-slate-100 whitespace-pre-wrap">
                      {instructionOutput}
                    </p>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={panelGlow}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <Wand2 className="h-5 w-5 text-sky-400" />
                  Tool Prediction Panel
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Query /predict_tools for the next recommended systems and automations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="border-sky-400/60 text-sky-300 hover:bg-slate-900/80"
                  onClick={handlePredictTools}
                  disabled={toolLoading}
                >
                  {toolLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Querying /predict_tools
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Pull Recommended Tools
                    </>
                  )}
                </Button>
                <div className="space-y-3">
                  {tools.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No tool predictions yet. Run the predictor to populate this space.
                    </p>
                  )}
                  {tools.map((tool) => (
                    <div
                      key={`${tool.name}-${tool.reason}`}
                      className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-white">{tool.name}</p>
                        {typeof tool.confidence === "number" && (
                          <Badge variant="outline" className="border-white/20 text-slate-200">
                            {Math.round(tool.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      {tool.reason && (
                        <p className="text-sm text-slate-300 mt-2">{tool.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={panelGlow}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <MemoryStick className="h-5 w-5 text-purple-400" />
                  Future Memory Panel
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Call /future to surface memory-based predictions and continuity plans.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="border-purple-400/60 text-purple-200 hover:bg-slate-900/80"
                  onClick={handleFutureMemory}
                  disabled={futureLoading}
                >
                  {futureLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing /future
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Retrieve Future Memory
                    </>
                  )}
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
                      Memory-based predictions
                    </p>
                    <ul className="space-y-2 text-sm text-slate-100">
                      {futureInsights.predictions.length === 0 && (
                        <li className="text-slate-400">No predictions yet.</li>
                      )}
                      {futureInsights.predictions.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-primary">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
                      Long-term continuity
                    </p>
                    <ul className="space-y-2 text-sm text-slate-100">
                      {futureInsights.continuity.length === 0 && (
                        <li className="text-slate-400">No continuity suggestions yet.</li>
                      )}
                      {futureInsights.continuity.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-purple-300">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={panelGlow}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <Activity className="h-5 w-5 text-teal-300" />
                  System Output Panels
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Unified telemetry for instruction, emotion, tool graph, and memory threads.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Instruction</p>
                    <ScrollArea className="mt-2 h-32 pr-2">
                      <p className="text-sm text-slate-100 whitespace-pre-wrap">
                        {instructionOutput}
                      </p>
                    </ScrollArea>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Emotion</p>
                    <p className="mt-2 text-lg text-slate-50">{emotionLabel}</p>
                    {emotionConfidence !== null && (
                      <p className="text-xs text-slate-400 mt-1">
                        Confidence {emotionConfidence}%
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tool Prediction</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-100">
                      {tools.length === 0 && <li className="text-slate-400">Awaiting predictions.</li>}
                      {tools.slice(0, 3).map((tool) => (
                        <li key={`${tool.name}-summary`}>
                          {tool.name}
                          {tool.reason && <span className="text-slate-400"> — {tool.reason}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Future Memory</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-100">
                      {futureInsights.predictions.length === 0 && futureInsights.continuity.length === 0 && (
                        <li className="text-slate-400">Awaiting /future sync.</li>
                      )}
                      {[...futureInsights.predictions, ...futureInsights.continuity]
                        .slice(0, 3)
                        .map((item, index) => (
                          <li key={`future-${index}`}>{item}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="bg-white/10" />
        <footer className="text-center text-xs uppercase tracking-[0.5em] text-slate-500">
          Fixish Internal AGI Fabric · Vision · Emotion · Tool Graph · Future Memory
        </footer>
      </div>
    </div>
  );
};

const UploadIcon = () => (
  <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
    <ImageIcon className="h-3 w-3 text-white" />
  </span>
);

export default Task;
