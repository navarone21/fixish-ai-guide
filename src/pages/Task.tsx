import { useState, useRef, useCallback } from "react";
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
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";
import { FixishAPI } from "@/lib/fixishApi";

const Task = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isProcessing,
    isUploadingImage,
    isUploadingAudio,
    isPredictingTools,
    isPredictingFuture,
    processResult,
    imageResult,
    audioResult,
    toolResult,
    futureResult,
    error,
    uploadedImage,
    setProcessing,
    setUploadingImage,
    setUploadingAudio,
    setPredictingTools,
    setPredictingFuture,
    setProcessResult,
    setImageResult,
    setAudioResult,
    setToolResult,
    setFutureResult,
    setError,
    setUploadedImage,
    setUploadedAudio,
  } = useFixishConsoleStore();

  // Handle AGI Process
  const handleProcess = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const result = await FixishAPI.process({ prompt });
      setProcessResult(result);
      toast({ title: "AGI processing complete" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Processing failed", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }, [prompt, setProcessing, setProcessResult, setError, toast]);

  // Handle Image Upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    
    setUploadingImage(true);
    setError(null);
    
    try {
      const result = await FixishAPI.uploadImage(file);
      setImageResult(result);
      toast({ title: "Image analyzed successfully" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Image upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  }, [setUploadedImage, setUploadingImage, setImageResult, setError, toast]);

  // Handle Audio Upload
  const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedAudio(URL.createObjectURL(file));
    setUploadingAudio(true);
    setError(null);
    
    try {
      const result = await FixishAPI.uploadAudio(file);
      setAudioResult(result);
      toast({ title: "Audio analyzed successfully" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Audio upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAudio(false);
    }
  }, [setUploadedAudio, setUploadingAudio, setAudioResult, setError, toast]);

  // Handle Tool Prediction
  const handlePredictTools = useCallback(async () => {
    setPredictingTools(true);
    setError(null);
    
    try {
      const result = await FixishAPI.predictTools();
      setToolResult(result);
      toast({ title: "Tools predicted" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Tool prediction failed", description: err.message, variant: "destructive" });
    } finally {
      setPredictingTools(false);
    }
  }, [setPredictingTools, setToolResult, setError, toast]);

  // Handle Future Prediction
  const handlePredictFuture = useCallback(async () => {
    setPredictingFuture(true);
    setError(null);
    
    try {
      const result = await FixishAPI.getFuture();
      setFutureResult(result);
      toast({ title: "Future predicted" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Future prediction failed", description: err.message, variant: "destructive" });
    } finally {
      setPredictingFuture(false);
    }
  }, [setPredictingFuture, setFutureResult, setError, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Fix-ISH AGI Console</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/super-agent")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Mode
            </Button>
            <Badge variant="outline" className="text-primary border-primary">
              localhost:5050
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
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* AGI Execution Panel */}
          <Card className="lg:col-span-2 xl:col-span-1 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Brain className="h-5 w-5" />
                AGI Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none bg-muted/50"
              />
              <Button 
                onClick={handleProcess} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Run AGI</>
                )}
              </Button>

              {/* AGI Results */}
              {processResult && (
                <ScrollArea className="h-[300px] mt-4">
                  <div className="space-y-4">
                    {processResult.instructions && (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <h4 className="font-medium text-primary mb-2">Instructions</h4>
                        <p className="text-sm text-foreground/80">{processResult.instructions}</p>
                      </div>
                    )}
                    
                    {processResult.steps && processResult.steps.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Layers className="h-4 w-4" /> Steps
                        </h4>
                        <ul className="space-y-2">
                          {processResult.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {processResult.warnings && processResult.warnings.length > 0 && (
                      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> Warnings
                        </h4>
                        <ul className="space-y-1">
                          {processResult.warnings.map((w, i) => (
                            <li key={i} className="text-sm text-destructive/80">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {processResult.agent_messages && processResult.agent_messages.length > 0 && (
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> Agent Messages
                        </h4>
                        {processResult.agent_messages.map((msg, i) => (
                          <p key={i} className="text-sm text-foreground/80 mb-1">{msg}</p>
                        ))}
                      </div>
                    )}

                    {processResult.emotion && (
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <h4 className="font-medium mb-2">Emotion Detected</h4>
                        <Badge variant="secondary">
                          {processResult.emotion.label} ({(processResult.emotion.confidence * 100).toFixed(0)}%)
                        </Badge>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Image Upload Panel */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div 
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded" className="max-h-40 mx-auto rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span>Drop image or click to upload</span>
                  </div>
                )}
              </div>

              {isUploadingImage && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              )}

              {imageResult && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Analysis Result</h4>
                  <p className="text-sm text-foreground/80">{imageResult.analysis || "No analysis available"}</p>
                  {imageResult.objects && imageResult.objects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {imageResult.objects.map((obj, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{obj}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Upload Panel */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-primary" />
                Audio / Emotion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="audio/*"
                ref={audioInputRef}
                onChange={handleAudioUpload}
                className="hidden"
              />
              
              <Button 
                variant="outline" 
                onClick={() => audioInputRef.current?.click()}
                className="w-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                Upload Audio / Voice Note
              </Button>

              {isUploadingAudio && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              )}

              {audioResult && (
                <div className="space-y-3">
                  {audioResult.transcription && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Transcription</h4>
                      <p className="text-sm text-foreground/80">{audioResult.transcription}</p>
                    </div>
                  )}
                  {audioResult.emotion && (
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <h4 className="font-medium mb-2">Emotion</h4>
                      <Badge className="bg-primary text-primary-foreground">
                        {audioResult.emotion.label} ({(audioResult.emotion.confidence * 100).toFixed(0)}%)
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool Prediction Panel */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Tool Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePredictTools} 
                disabled={isPredictingTools}
                className="w-full"
                variant="outline"
              >
                {isPredictingTools ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Predicting...</>
                ) : (
                  <><Wrench className="h-4 w-4 mr-2" /> Predict Required Tools</>
                )}
              </Button>

              {toolResult && toolResult.tools && toolResult.tools.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">Recommended Tools</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {toolResult.tools.map((tool, i) => (
                      <div key={i} className="p-2 bg-background rounded border border-border text-sm flex items-center gap-2">
                        <Wrench className="h-3 w-3 text-primary" />
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Future Memory Panel */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Future Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePredictFuture} 
                disabled={isPredictingFuture}
                className="w-full"
                variant="outline"
              >
                {isPredictingFuture ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Predicting...</>
                ) : (
                  <><Clock className="h-4 w-4 mr-2" /> Predict Next Steps</>
                )}
              </Button>

              {futureResult && (
                <div className="space-y-3">
                  {futureResult.next_steps && futureResult.next_steps.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Next Steps</h4>
                      <ul className="space-y-2">
                        {futureResult.next_steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-medium">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {futureResult.continuity && (
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <h4 className="font-medium mb-2">Continuity Reasoning</h4>
                      <p className="text-sm text-foreground/80">{futureResult.continuity}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Panel */}
          {processResult?.timeline && (
            <Card className="lg:col-span-2 xl:col-span-3 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  Timeline (Past / Future)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3 text-muted-foreground">Past</h4>
                    {processResult.timeline.past && processResult.timeline.past.length > 0 ? (
                      <ul className="space-y-2">
                        {processResult.timeline.past.map((item: any, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No past events</p>
                    )}
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="font-medium mb-3 text-primary">Future</h4>
                    {processResult.timeline.future && processResult.timeline.future.length > 0 ? (
                      <ul className="space-y-2">
                        {processResult.timeline.future.map((item: any, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary">→</span>
                            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No future predictions</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
};

export default Task;
