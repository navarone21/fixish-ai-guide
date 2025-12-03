import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Fix-ISH Core Hooks
import { useFixishState } from "@/hooks/useFixishState";
import { useFixish } from "@/contexts/FixishProvider";
import { useFixishCamera } from "@/hooks/useFixishCamera";
import { useFixishGuidance } from "@/hooks/useFixishGuidance";
import { useFixishWorld } from "@/hooks/useFixishWorld";
import { useFixishHazards } from "@/hooks/useFixishHazards";
import { useFixishTool } from "@/hooks/useFixishTool";
import { useFixishErrors } from "@/hooks/useFixishErrors";
import { useStepAutoCompletion } from "@/hooks/useStepAutoCompletion";
import { useOcclusionMask } from "@/hooks/useOcclusionMask";
import { useVoiceCoach } from "@/hooks/useVoiceCoach";
import { useStepReplay } from "@/hooks/useStepReplay";
import { useTroubleshoot } from "@/hooks/useTroubleshoot";
import { useVideoClip } from "@/hooks/useVideoClip";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useCamera } from "@/hooks/useCamera";
import { FixishClient } from "@/lib/FixishClient";
import { useFeatureStore } from "@/state/featureStore";

// UI Components
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import SafetyAlert from "@/components/SafetyAlert";
import InstructionsPanel from "@/components/InstructionsPanel";
import ObjectsPanel from "@/components/ObjectsPanel";
import MeshStatus from "@/components/MeshStatus";
import GuidanceOverlay from "@/components/GuidanceOverlay";
import AROverlayCanvas from "@/components/AROverlayCanvas";
import ActionArrow from "@/components/ActionArrow";
import StepGuidanceOverlay from "@/components/StepGuidanceOverlay";
import DirectionalArrow from "@/components/DirectionalArrow";
import ActionPath from "@/components/ActionPath";
import StepSequencePanel from "@/components/StepSequencePanel";
import DepthMapCanvas from "@/components/DepthMapCanvas";
import PointCloudViewer from "@/components/PointCloudViewer";
import MeshViewer from "@/components/MeshViewer";
import HazardAlert from "@/components/HazardAlert";
import GestureBubble from "@/components/GestureBubble";
import ToolHUD from "@/components/ToolHUD";
import ToolAlert from "@/components/ToolAlert";
import StepCompletedBubble from "@/components/StepCompletedBubble";
import OcclusionWarning from "@/components/OcclusionWarning";
import CameraSwitchButton from "@/components/CameraSwitchButton";
import CameraWarning from "@/components/CameraWarning";
import ErrorAlert from "@/components/ErrorAlert";
import StepReplayGhost from "@/components/StepReplayGhost";
import TroubleshootPanel from "@/components/TroubleshootPanel";
import StepVideoPlayer from "@/components/StepVideoPlayer";
import SceneGraphPanel from "@/components/SceneGraphPanel";
import GestureIndicator from "@/components/GestureIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Camera, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Image as ImageIcon, 
  Video, 
  X, 
  Settings2, 
  Zap,
  Shield,
  Eye,
  Layers,
  Volume2,
  VolumeX
} from "lucide-react";

type Mode = "chat" | "live";
type SkillLevel = "beginner" | "intermediate" | "expert";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: { type: "image" | "video"; url: string; name?: string };
  steps?: string[];
  tools?: string[];
  warnings?: string[];
}

export default function SuperAgent() {
  const { toast } = useToast();
  
  // Mode & Settings
  const [mode, setMode] = useState<Mode>("chat");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const handTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);

  // Fix-ISH Live Hooks
  const { features, toggleFeature } = useFeatureStore();
  const state = useFixishState();
  const guidance = useFixishGuidance();
  const world = useFixishWorld();
  const { videoRef, canvasRef, startCamera, stopCamera, isStreaming } = useFixishCamera();
  const { overlay } = useFixish();
  const hazards = useFixishHazards();
  const tool = useFixishTool();
  const autoComplete = useStepAutoCompletion();
  const occlusionMask = useOcclusionMask();
  const errors = useFixishErrors();
  const replayData = useStepReplay();
  const trouble = useTroubleshoot();
  const videoClip = useVideoClip();
  const { cameras, activeId, switchCamera } = useCamera(cameraVideoRef);
  
  // Gesture & Camera State
  const [gesture, setGesture] = useState<string | null>(null);
  const [camAlive, setCamAlive] = useState(true);
  const [replay, setReplay] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"camera" | "depth" | "pointcloud" | "mesh">("camera");
  
  // Enable voice coach when voice is enabled
  useVoiceCoach();
  useHandTracking(handTrackingVideoRef);

  // Subscribe to backend events
  useEffect(() => {
    const client = FixishClient.getInstance();
    if (!client) return;
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.gesture) setGesture(data.gesture);
      if (data?.camera_alive !== undefined) setCamAlive(data.camera_alive);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (replayData && replayData.length > 0) setReplay(replayData);
  }, [replayData]);

  useEffect(() => {
    if (gesture === "ok" && replay.length > 0) setReplay([...replay]);
  }, [gesture, replay]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const activeStep = world?.task_state?.active_step;

  // File handling
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ type, url, file });
    e.target.value = "";
  };

  // Send message to backend
  const handleSendMessage = async () => {
    if (!input.trim() && !mediaPreview) return;

    const userMessage: Message = {
      role: "user",
      content: input || "[Media Uploaded]",
      timestamp: new Date(),
      media: mediaPreview ? { type: mediaPreview.type as any, url: mediaPreview.url, name: mediaPreview.file.name } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    const currentMedia = mediaPreview;
    setMediaPreview(null);
    setIsLoading(true);

    try {
      const payload: any = {
        prompt: currentInput || "Analyze this and provide repair guidance",
        mode: "auto",
        skill_level: skillLevel
      };

      if (currentMedia) {
        const base64 = await fileToBase64(currentMedia.file);
        payload.media = [{ name: currentMedia.file.name, type: currentMedia.file.type, data: base64 }];
      }

      const response = await fetch("https://fix-ish-1.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || data.response || data.message || "I've analyzed your request.",
        timestamp: new Date(),
        steps: data.steps,
        tools: data.tools,
        warnings: data.warnings
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak response if voice enabled
      if (voiceEnabled && assistantMessage.content) {
        speak(assistantMessage.content);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Connection Error", description: "Could not reach Fix-ISH backend.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = skillLevel === "expert" ? 1.2 : skillLevel === "beginner" ? 0.9 : 1.0;
      speechSynthesis.speak(utter);
    } catch {}
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
    toast({ title: isRecording ? "Recording stopped" : "Listening...", description: isRecording ? "Processing your voice..." : "Speak now" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* MODE SWITCHER & SETTINGS */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <Button
            variant={mode === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("chat")}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          <Button
            variant={mode === "live" ? "default" : "outline"}
            size="sm"
            onClick={() => { setMode("live"); if (!isStreaming) startCamera(); }}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            Live AR
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>

        {/* SETTINGS PANEL */}
        {showSettings && (
          <Card className="absolute top-16 left-4 z-50 p-4 w-72 bg-background/95 backdrop-blur-sm border shadow-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Skill Level</label>
                <div className="flex gap-2">
                  {(["beginner", "intermediate", "expert"] as SkillLevel[]).map(level => (
                    <Badge
                      key={level}
                      variant={skillLevel === level ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setSkillLevel(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice Guidance</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety Warnings</span>
                <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" /> Active</Badge>
              </div>
              
              <div className="border-t pt-3">
                <label className="text-sm font-medium mb-2 block">Features</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge 
                    variant={features.arOverlay ? "default" : "outline"} 
                    className="cursor-pointer justify-center"
                    onClick={() => toggleFeature("arOverlay")}
                  >
                    <Layers className="w-3 h-3 mr-1" /> AR Overlay
                  </Badge>
                  <Badge 
                    variant={features.depth ? "default" : "outline"}
                    className="cursor-pointer justify-center"
                    onClick={() => toggleFeature("depth")}
                  >
                    <Eye className="w-3 h-3 mr-1" /> Depth
                  </Badge>
                  <Badge 
                    variant={features.mesh ? "default" : "outline"}
                    className="cursor-pointer justify-center"
                    onClick={() => toggleFeature("mesh")}
                  >
                    <Zap className="w-3 h-3 mr-1" /> 3D Mesh
                  </Badge>
                  <Badge 
                    variant={features.voice ? "default" : "outline"}
                    className="cursor-pointer justify-center"
                    onClick={() => toggleFeature("voice")}
                  >
                    <Volume2 className="w-3 h-3 mr-1" /> Voice
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* CHAT MODE */}
        {mode === "chat" && (
          <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto p-4">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Fix-ISH Super Agent</h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Describe what you need help with or upload a photo/video. I'll detect the issue, guide you through repairs with AR overlays, voice instructions, and safety warnings.
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Badge variant="secondary">🔧 Auto-detect issues</Badge>
                    <Badge variant="secondary">📹 AR guidance</Badge>
                    <Badge variant="secondary">🗣️ Voice coaching</Badge>
                    <Badge variant="secondary">⚠️ Safety alerts</Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        {msg.media && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            {msg.media.type === "image" && <img src={msg.media.url} alt="" className="max-h-48 rounded" />}
                            {msg.media.type === "video" && <video src={msg.media.url} controls className="max-h-48 rounded" />}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.steps.map((step, j) => (
                              <div key={j} className="flex gap-2 items-start p-2 bg-background/50 rounded-lg text-sm">
                                <Badge variant="outline" className="shrink-0">{j + 1}</Badge>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {msg.tools && msg.tools.length > 0 && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {msg.tools.map((t, j) => (
                              <Badge key={j} variant="secondary">🔧 {t}</Badge>
                            ))}
                          </div>
                        )}
                        
                        {msg.warnings && msg.warnings.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {msg.warnings.map((w, j) => (
                              <div key={j} className="text-sm text-destructive flex items-center gap-1">
                                <Shield className="w-3 h-3" /> {w}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl p-4">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* INPUT AREA */}
            <div className="border-t pt-4 mt-4">
              {mediaPreview && (
                <div className="mb-3 relative inline-block">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full z-10"
                    onClick={() => { URL.revokeObjectURL(mediaPreview.url); setMediaPreview(null); }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  {mediaPreview.type === "image" && <img src={mediaPreview.url} alt="" className="h-20 rounded-lg" />}
                  {mediaPreview.type === "video" && <video src={mediaPreview.url} className="h-20 rounded-lg" />}
                </div>
              )}
              
              <div className="flex gap-2 items-end">
                <div className="flex gap-1">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />
                  <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()}>
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
                  <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()}>
                    <Video className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    variant={isRecording ? "destructive" : "ghost"} 
                    size="icon" 
                    onClick={toggleVoiceRecording}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Describe what needs fixing..."
                  className="flex-1 min-h-[48px] max-h-32 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={1}
                />
                
                <Button onClick={handleSendMessage} disabled={isLoading} size="icon" className="h-12 w-12 rounded-xl">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE AR MODE */}
        {mode === "live" && (
          <div className="relative w-full h-[calc(100vh-8rem)] bg-black overflow-hidden">
            {/* CAMERA FEED */}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <video ref={handTrackingVideoRef} className="hidden" />
            <video ref={cameraVideoRef} className="hidden" />

            {/* AR OVERLAYS */}
            {world && features.arOverlay && (
              <AROverlayCanvas world={world} width={window.innerWidth} height={window.innerHeight} />
            )}

            {overlay && (
              <img
                src={`data:image/jpeg;base64,${overlay}`}
                alt="AR Overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90"
              />
            )}

            <GuidanceOverlay message={guidance} />
            {features.gestureControl && <GestureBubble gesture={gesture} />}
            <ToolHUD tool={tool} />
            <ToolAlert tool={tool} />
            <StepCompletedBubble visible={autoComplete} />
            <OcclusionWarning occluded={activeStep?.occluded} />
            <CameraSwitchButton cameras={cameras} activeId={activeId} onSwitch={switchCamera} />
            <CameraWarning alive={camAlive} />
            <ErrorAlert errors={errors} />
            
            {features.ghostReplay && replay.length > 0 && <StepReplayGhost replay={replay} />}
            {features.troubleshooting && trouble && <TroubleshootPanel trouble={trouble} />}
            {features.stepClips && videoClip && <StepVideoPlayer frames={videoClip} />}
            
            {features.sceneGraph && world?.scene_graph && (
              <div className="absolute top-20 left-4 w-64 z-30">
                <SceneGraphPanel scene={world.scene_graph} />
              </div>
            )}
            
            {features.gestureControl && gesture && (
              <div className="absolute bottom-20 right-4 w-48 z-30">
                <GestureIndicator gesture={gesture} />
              </div>
            )}

            {world?.task_state?.active_target_center && (
              <ActionArrow x={world.task_state.active_target_center.x} y={world.task_state.active_target_center.y} />
            )}

            {activeStep?.bbox && (
              <StepGuidanceOverlay target={{ x: activeStep.bbox[0], y: activeStep.bbox[1], w: activeStep.bbox[2], h: activeStep.bbox[3] }} />
            )}

            {activeStep?.direction && activeStep?.center && (
              <DirectionalArrow dir={activeStep.direction} x={activeStep.center.x} y={activeStep.center.y} />
            )}

            {activeStep?.path_points && <ActionPath path={activeStep.path_points} />}

            {/* VIEW MODE TOGGLE */}
            <div className="absolute top-16 right-4 z-40 flex flex-col gap-1">
              {(["camera", "depth", "pointcloud", "mesh"] as const).map(v => (
                <Button
                  key={v}
                  variant={viewMode === v ? "default" : "secondary"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setViewMode(v)}
                >
                  {v === "camera" ? "Camera" : v === "depth" ? "Depth" : v === "pointcloud" ? "Points" : "Mesh"}
                </Button>
              ))}
            </div>

            {/* VIEW MODE DISPLAYS */}
            {features.depth && viewMode === "depth" && world?.depth && (
              <DepthMapCanvas depth={world.depth} width={window.innerWidth} height={window.innerHeight} />
            )}
            {viewMode === "pointcloud" && world?.point_cloud && <PointCloudViewer points={world.point_cloud} />}
            {features.mesh && viewMode === "mesh" && world?.mesh && <MeshViewer mesh={world.mesh} />}

            {/* STATE OVERLAYS */}
            {state === "idle" && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                <p className="text-xl font-bold text-white">Point your camera at the object</p>
                <Button onClick={isStreaming ? stopCamera : startCamera} size="lg">
                  {isStreaming ? "Stop Camera" : "Start Scanning"}
                </Button>
              </div>
            )}

            {state === "scanning" && (
              <div className="absolute top-20 left-4 text-sm px-3 py-1 bg-white/20 backdrop-blur-sm rounded-md text-white">
                Scanning… Move camera slowly
              </div>
            )}

            {state === "analyzing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="text-xl font-semibold text-white animate-pulse">Analyzing… Hold still</p>
              </div>
            )}

            {state === "generating_steps" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <p className="text-2xl animate-pulse text-white">Generating repair steps…</p>
              </div>
            )}

            {state === "instructing" && <InstructionsPanel />}

            {state === "awaiting_user_action" && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button size="lg">Mark Step Complete</Button>
              </div>
            )}

            {state === "paused" && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-white">Paused</p>
                <Button size="lg">Resume</Button>
              </div>
            )}

            {state === "error" && (
              <div className="absolute inset-0 bg-destructive/60 flex items-center justify-center">
                <p className="text-xl font-bold text-white">Error — adjust camera or restart</p>
              </div>
            )}

            {state === "completed" && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <p className="text-3xl font-bold text-green-400">✔ Repair Completed!</p>
              </div>
            )}

            {/* PERSISTENT PANELS */}
            <ObjectsPanel />
            <SafetyAlert />
            <MeshStatus />
            <StepSequencePanel sequence={world?.task_state?.sequence} />
            <HazardAlert hazards={hazards} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
