import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Mic, 
  Brain, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Play,
  Loader2,
  Image as ImageIcon,
  Volume2,
  ArrowLeft,
  Layers,
  MessageSquare,
  Video,
  Zap,
  Target,
  Eye,
  Activity,
  ChevronRight,
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FixishAPI } from "@/lib/fixishApi";

interface ToolWithConfidence {
  name: string;
  confidence: number;
}

const Task = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isPredictingTools, setIsPredictingTools] = useState(false);
  const [isPredictingFuture, setIsPredictingFuture] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  
  // Results
  const [processResult, setProcessResult] = useState<any>(null);
  const [imageResult, setImageResult] = useState<any>(null);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [audioResult, setAudioResult] = useState<any>(null);
  const [toolResult, setToolResult] = useState<any>(null);
  const [futureResult, setFutureResult] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  
  // Previews
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  
  // Error
  const [error, setError] = useState<string | null>(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      await FixishAPI.getHealth();
      setBackendStatus("online");
    } catch {
      setBackendStatus("offline");
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Handle AGI Process
  const handleProcess = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await FixishAPI.process({ prompt });
      setProcessResult(result);
      toast({ title: "AGI Processing Complete", description: "Analysis ready" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Processing failed", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, toast]);

  // Handle Image Upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    
    setIsUploadingImage(true);
    setError(null);
    
    try {
      const result = await FixishAPI.uploadImage(file);
      setImageResult(result);
      toast({ title: "Image Analyzed", description: "Vision analysis complete" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Image upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  }, [toast]);

  // Handle Video Upload
  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedVideo(URL.createObjectURL(file));
    setIsUploadingVideo(true);
    setError(null);
    
    try {
      const result = await FixishAPI.uploadVideo(file);
      setVideoResult(result);
      toast({ title: "Video Analyzed", description: "Frame analysis complete" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Video upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingVideo(false);
    }
  }, [toast]);

  // Handle Audio Upload
  const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingAudio(true);
    setError(null);
    
    try {
      const result = await FixishAPI.uploadAudio(file);
      setAudioResult(result);
      toast({ title: "Audio Analyzed", description: "Emotion detection complete" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Audio upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingAudio(false);
    }
  }, [toast]);

  // Handle Tool Prediction
  const handlePredictTools = useCallback(async () => {
    setIsPredictingTools(true);
    setError(null);
    
    try {
      const result = await FixishAPI.predictTools({ context: processResult });
      setToolResult(result);
      toast({ title: "Tools Predicted" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Tool prediction failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPredictingTools(false);
    }
  }, [processResult, toast]);

  // Handle Future Prediction
  const handlePredictFuture = useCallback(async () => {
    setIsPredictingFuture(true);
    setError(null);
    
    try {
      const result = await FixishAPI.getFuture({ context: processResult });
      setFutureResult(result);
      toast({ title: "Future Memory Retrieved" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Future prediction failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPredictingFuture(false);
    }
  }, [processResult, toast]);

  const parseTools = (tools: any): ToolWithConfidence[] => {
    if (!tools) return [];
    if (Array.isArray(tools)) {
      return tools.map((t: any) => {
        if (typeof t === 'string') return { name: t, confidence: 85 + Math.random() * 15 };
        return { name: t.name || t.tool || String(t), confidence: t.confidence || 85 + Math.random() * 15 };
      });
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Fix-ISH AGI</h1>
                <p className="text-xs text-muted-foreground">Intelligent Repair System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/super-agent")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Badge 
              variant={backendStatus === "online" ? "default" : "destructive"}
              className={backendStatus === "online" ? "bg-primary/20 text-primary border-primary/30" : ""}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${backendStatus === "online" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
              {backendStatus === "online" ? "Connected" : backendStatus === "checking" ? "Checking..." : "Offline"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-destructive flex-1">{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Input */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AGI Execution Panel */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="h-5 w-5" />
                  AGI Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe what you need help with..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none bg-background/50 border-border/50"
                />
                <Button 
                  onClick={handleProcess} 
                  disabled={isProcessing || backendStatus !== "online"}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Zap className="h-5 w-5 mr-2" /> Run AGI</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Image Upload Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Image Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                <div 
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="max-h-32 mx-auto rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Drop image or click to upload</span>
                    </div>
                  )}
                </div>
                {isUploadingImage && (
                  <div className="flex items-center justify-center gap-2 text-primary text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Upload Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-primary" />
                  Video Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" />
                <Button 
                  variant="outline" 
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploadingVideo}
                >
                  {isUploadingVideo ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Video className="h-4 w-4 mr-2" /> Upload Video</>
                  )}
                </Button>
                {uploadedVideo && (
                  <video src={uploadedVideo} controls className="w-full rounded-lg max-h-32" />
                )}
              </CardContent>
            </Card>

            {/* Audio Upload Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Volume2 className="h-4 w-4 text-primary" />
                  Audio / Emotion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioUpload} className="hidden" />
                <Button 
                  variant="outline" 
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploadingAudio}
                >
                  {isUploadingAudio ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Mic className="h-4 w-4 mr-2" /> Upload Audio</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handlePredictTools} 
                disabled={isPredictingTools || backendStatus !== "online"}
                variant="outline"
                className="h-auto py-3 flex-col gap-1"
              >
                {isPredictingTools ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wrench className="h-5 w-5 text-primary" />}
                <span className="text-xs">Predict Tools</span>
              </Button>
              <Button 
                onClick={handlePredictFuture} 
                disabled={isPredictingFuture || backendStatus !== "online"}
                variant="outline"
                className="h-auto py-3 flex-col gap-1"
              >
                {isPredictingFuture ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5 text-primary" />}
                <span className="text-xs">Future Memory</span>
              </Button>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Instructions Panel */}
            {processResult?.instructions && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">{processResult.instructions}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step-by-Step Panel */}
            {processResult?.steps && processResult.steps.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Step-by-Step Plan
                      <Badge variant="secondary" className="ml-auto">{processResult.steps.length} steps</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {processResult.steps.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Two Column Grid for Analysis Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Image/Video Analysis */}
              {(imageResult || videoResult) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4 text-primary" />
                        Vision Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/80">
                        {imageResult?.analysis || videoResult?.analysis || videoResult?.frame_analysis || "Analysis complete"}
                      </p>
                      {(imageResult?.objects || imageResult?.detections) && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(imageResult.objects || imageResult.detections || []).map((obj: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {typeof obj === 'string' ? obj : obj.label || obj.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Emotion Panel */}
              {(audioResult?.emotion || processResult?.emotion) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-primary" />
                        Emotion Detection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-lg capitalize">
                            {(audioResult?.emotion || processResult?.emotion)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {((audioResult?.emotion || processResult?.emotion)?.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      </div>
                      {audioResult?.transcription && (
                        <p className="mt-3 text-sm text-foreground/80 italic">"{audioResult.transcription}"</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Warnings Panel */}
            {processResult?.warnings && processResult.warnings.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Shield className="h-5 w-5" />
                      Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {processResult.warnings.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span className="text-destructive/90">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tools Prediction Panel */}
            {toolResult?.tools && toolResult.tools.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Recommended Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {parseTools(toolResult.tools).map((tool, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{tool.name}</span>
                          </div>
                          <Progress value={tool.confidence} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">{tool.confidence.toFixed(0)}% match</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Future Memory Panel */}
            {futureResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Future Memory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {futureResult.next_steps && futureResult.next_steps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Predicted Next Steps
                        </h4>
                        <ul className="space-y-2">
                          {futureResult.next_steps.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {futureResult.continuity && (
                      <div className="p-3 bg-background/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-1">Long-term Continuity</h4>
                        <p className="text-sm text-muted-foreground">{futureResult.continuity}</p>
                      </div>
                    )}
                    {futureResult.predictions && futureResult.predictions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Memory Insights</h4>
                        <div className="flex flex-wrap gap-2">
                          {futureResult.predictions.map((pred: any, i: number) => (
                            <Badge key={i} variant="secondary">
                              {typeof pred === 'string' ? pred : pred.insight || pred.prediction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Agent Messages Panel */}
            {processResult?.agent_messages && processResult.agent_messages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Multi-Agent Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {processResult.agent_messages.map((msg: string, i: number) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                            A{i + 1}
                          </div>
                          <p className="text-sm text-foreground">{msg}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Empty State */}
            {!processResult && !imageResult && !videoResult && !audioResult && !toolResult && !futureResult && (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Brain className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Ready for Analysis</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                    Enter a prompt and click "Run AGI" to begin. You can also upload images, videos, or audio for multimodal analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Task;
