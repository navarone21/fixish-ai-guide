import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { RepairTemplates } from "@/components/RepairTemplates";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  VolumeX,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload
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
  confidence?: number;
}

const modePresets = {
  beginner: { label: "Guided", description: "Full assistance with detailed explanations", icon: "🎓" },
  expert: { label: "Expert", description: "Streamlined interface for professionals", icon: "⚡" },
  minimal: { label: "Focus", description: "Clean UI with essential features", icon: "🎯" },
  developer: { label: "Full Suite", description: "All capabilities unlocked", icon: "🔧" },
  ar_heavy: { label: "Visual", description: "Enhanced AR and visual overlays", icon: "👁️" },
  safety_first: { label: "Careful", description: "Prioritizes safety and verification", icon: "🛡️" },
};

export default function SuperAgent() {
  const { toast } = useToast();
  
  // Mode & Settings
  const [mode, setMode] = useState<Mode>("chat");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("modes");
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const handTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);

  // Fix-ISH Live Hooks
  const { features, toggleFeature, currentMode, setMode: setFeatureMode } = useFeatureStore();
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

  // Hide templates when messages exist
  useEffect(() => {
    if (messages.length > 0) setShowTemplates(false);
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
    setShowTemplates(false);
    e.target.value = "";
  };

  const handleTemplateSelect = (prompt: string) => {
    setInput(prompt);
    setShowTemplates(false);
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
    setShowTemplates(false);
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
        warnings: data.warnings,
        confidence: data.confidence
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

  const clearChat = () => {
    setMessages([]);
    setShowTemplates(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* TOP CONTROL BAR */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between"
        >
          {/* Mode Switcher */}
          <div className="flex gap-2 bg-background/80 backdrop-blur-sm rounded-xl p-1 border shadow-lg">
            <Button
              variant={mode === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("chat")}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
            <Button
              variant={mode === "live" ? "default" : "ghost"}
              size="sm"
              onClick={() => { setMode("live"); if (!isStreaming) startCamera(); }}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Live AR</span>
            </Button>
          </div>

          {/* Center Status */}
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
            </Badge>
            {voiceEnabled && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                <Volume2 className="w-3 h-3 mr-1" />
                Voice On
              </Badge>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="bg-background/80 backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant={showSettings ? "default" : "outline"}
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={showSettings ? "" : "bg-background/80 backdrop-blur-sm"}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* SETTINGS PANEL */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="absolute top-16 right-4 z-50"
            >
              <Card className="p-4 w-80 bg-background/95 backdrop-blur-sm border shadow-xl">
                <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="modes">Modes</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="voice">Voice</TabsTrigger>
                  </TabsList>

                  <TabsContent value="modes" className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(modePresets).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant={currentMode === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFeatureMode(key)}
                          className="h-auto flex-col py-2 text-left"
                        >
                          <span className="text-lg mb-1">{preset.icon}</span>
                          <span className="text-xs font-medium">{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      {modePresets[currentMode as keyof typeof modePresets]?.description || "Custom configuration"}
                    </p>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-3">
                    <div className="space-y-2">
                      {[
                        { key: "arOverlay", label: "AR Overlay", icon: <Layers className="w-4 h-4" /> },
                        { key: "depth", label: "Depth Maps", icon: <Eye className="w-4 h-4" /> },
                        { key: "mesh", label: "3D Mesh", icon: <Zap className="w-4 h-4" /> },
                        { key: "ghostReplay", label: "Step Replay", icon: <RotateCcw className="w-4 h-4" /> },
                        { key: "troubleshooting", label: "Troubleshooting", icon: <AlertTriangle className="w-4 h-4" /> },
                        { key: "sceneGraph", label: "Scene Graph", icon: <FileText className="w-4 h-4" /> },
                        { key: "gestureControl", label: "Gestures", icon: <Sparkles className="w-4 h-4" /> },
                        { key: "stepClips", label: "Video Clips", icon: <Video className="w-4 h-4" /> },
                      ].map(({ key, label, icon }) => (
                        <div key={key} className="flex items-center justify-between py-1">
                          <Label className="flex items-center gap-2 text-sm cursor-pointer">
                            {icon}
                            {label}
                          </Label>
                          <Switch
                            checked={features[key as keyof typeof features]}
                            onCheckedChange={() => toggleFeature(key as any)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="voice" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Voice Guidance
                      </Label>
                      <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Skill Level</Label>
                      <div className="flex gap-2">
                        {(["beginner", "intermediate", "expert"] as SkillLevel[]).map(level => (
                          <Button
                            key={level}
                            variant={skillLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSkillLevel(level)}
                            className="flex-1 capitalize text-xs"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {skillLevel === "beginner" && "Slower speech, more detail"}
                        {skillLevel === "intermediate" && "Balanced guidance"}
                        {skillLevel === "expert" && "Faster, concise instructions"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Safety Warnings
                      </span>
                      <Badge variant="secondary">Always On</Badge>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHAT MODE */}
        {mode === "chat" && (
          <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto p-4 pt-20">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <AnimatePresence mode="wait">
                {showTemplates && messages.length === 0 ? (
                  <motion.div
                    key="templates"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RepairTemplates onSelectTemplate={handleTemplateSelect} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 py-4"
                  >
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-4 ${
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
                          
                          {msg.confidence !== undefined && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 bg-background/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${msg.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs opacity-70">{Math.round(msg.confidence * 100)}%</span>
                            </div>
                          )}
                          
                          {msg.steps && msg.steps.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-semibold opacity-70 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Repair Steps
                              </div>
                              {msg.steps.map((step, j) => (
                                <div key={j} className="flex gap-2 items-start p-2 bg-background/50 rounded-lg text-sm">
                                  <Badge variant="outline" className="shrink-0">{j + 1}</Badge>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {msg.tools && msg.tools.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold opacity-70 mb-1">Tools Needed</div>
                              <div className="flex gap-2 flex-wrap">
                                {msg.tools.map((t, j) => (
                                  <Badge key={j} variant="secondary">🔧 {t}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {msg.warnings && msg.warnings.length > 0 && (
                            <div className="mt-3 p-2 bg-destructive/10 rounded-lg">
                              <div className="text-xs font-semibold text-destructive mb-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Safety Warnings
                              </div>
                              {msg.warnings.map((w, j) => (
                                <div key={j} className="text-sm text-destructive/90 flex items-center gap-1">
                                  <ChevronRight className="w-3 h-3" /> {w}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs opacity-50 mt-2">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted rounded-2xl p-4">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* INPUT AREA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t pt-4 mt-4"
            >
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
                  {mediaPreview.type === "document" && (
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 items-end bg-muted/50 rounded-2xl p-3 border border-border/50">
                <div className="flex gap-1 shrink-0">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />
                  <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} title="Upload image" className="hover:bg-primary/10">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </Button>
                  
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
                  <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()} title="Upload video" className="hover:bg-primary/10">
                    <Video className="w-5 h-5 text-primary" />
                  </Button>

                  <input ref={docInputRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={(e) => handleFileChange(e, "document")} />
                  <Button variant="ghost" size="icon" onClick={() => docInputRef.current?.click()} title="Upload document" className="hover:bg-primary/10">
                    <Upload className="w-5 h-5 text-primary" />
                  </Button>
                  
                  <VoiceRecorder onTranscript={handleVoiceTranscript} isDarkMode={false} />
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Ask anything or describe your task..."
                  className="flex-1 min-h-[48px] max-h-32 resize-none bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/60"
                  rows={1}
                />
                
                <div className="flex gap-1">
                  {messages.length > 0 && (
                    <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat" className="hover:bg-destructive/10 hover:text-destructive">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !mediaPreview)} size="icon" className="h-10 w-10 rounded-xl shadow-md">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Upload images, videos, or documents for AI analysis
                </span>
              </div>
            </motion.div>
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
              <div className="absolute top-24 left-4 w-64 z-30">
                <SceneGraphPanel scene={world.scene_graph} />
              </div>
            )}
            
            {features.gestureControl && gesture && (
              <div className="absolute bottom-24 right-4 w-48 z-30">
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
            <div className="absolute top-24 right-4 z-40 flex flex-col gap-1">
              {(["camera", "depth", "pointcloud", "mesh"] as const).map(v => (
                <Button
                  key={v}
                  variant={viewMode === v ? "default" : "secondary"}
                  size="sm"
                  className="text-xs w-20"
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
              >
                <div className="text-center max-w-md px-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-2xl font-semibold text-white mb-3">Ready for Live Analysis</p>
                  <p className="text-sm text-white/70 mb-8">Point your camera at any object, document, or scene. The AI will automatically detect, analyze, and provide real-time guidance.</p>
                </div>
                <Button onClick={isStreaming ? stopCamera : startCamera} size="lg" className="gap-2 px-8 shadow-lg">
                  {isStreaming ? <><Pause className="w-5 h-5" /> Stop Camera</> : <><Play className="w-5 h-5" /> Begin Analysis</>}
                </Button>
              </motion.div>
            )}

            {state === "scanning" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-24 left-4 px-4 py-2 bg-primary/90 backdrop-blur-sm rounded-lg text-white flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Scanning… Move camera slowly
              </motion.div>
            )}

            {state === "analyzing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-xl font-semibold text-white">Analyzing… Hold still</p>
                </div>
              </div>
            )}

            {state === "generating_steps" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-2xl text-white">Generating repair steps…</p>
                </div>
              </div>
            )}

            {state === "instructing" && <InstructionsPanel />}

            {state === "awaiting_user_action" && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <Button size="lg" className="gap-2 shadow-lg">
                  <CheckCircle2 className="w-5 h-5" /> Mark Step Complete
                </Button>
              </div>
            )}

            {state === "paused" && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                <Pause className="w-16 h-16 text-white/50" />
                <p className="text-xl text-white">Paused</p>
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" /> Resume
                </Button>
              </div>
            )}

            {state === "error" && (
              <div className="absolute inset-0 bg-destructive/60 flex flex-col items-center justify-center gap-4">
                <AlertTriangle className="w-16 h-16 text-white" />
                <p className="text-xl font-bold text-white">Error — adjust camera or restart</p>
                <Button variant="secondary" onClick={() => { stopCamera(); startCamera(); }}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </div>
            )}

            {state === "completed" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4"
              >
                <CheckCircle2 className="w-20 h-20 text-green-400" />
                <p className="text-3xl font-bold text-green-400">Repair Completed!</p>
                <Button onClick={clearChat} className="mt-4">Start New Repair</Button>
              </motion.div>
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
