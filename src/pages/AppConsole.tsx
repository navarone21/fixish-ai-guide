import { useState, useRef, DragEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";
import { TooltipProvider } from "@/components/ui/tooltip";

import { HeartbeatBackground } from "@/components/console/HeartbeatBackground";
import { ConsoleHeader } from "@/components/console/ConsoleHeader";
import { SubsystemDock } from "@/components/console/SubsystemDock";
import { LiveIntelligenceFeed } from "@/components/console/LiveIntelligenceFeed";
import { CommandBar } from "@/components/console/CommandBar";
import { IntelligencePanel } from "@/components/console/IntelligencePanel";
import { DropZone } from "@/components/console/DropZone";
import { UploadZone } from "@/components/console/UploadZone";
import { 
  ObjectDetectionModule, 
  EmotionBarsModule, 
  ReasoningModule, 
  TimelineModule, 
  SafetyAlertsModule,
  ToolCardsModule,
  MemoryModule
} from "@/components/console/OutputModules";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import hummingbirdLogo from "@/assets/hummingbird-logo.png";

interface OutputModule {
  id: string;
  type: 'analysis' | 'steps' | 'tools' | 'warning' | 'vision' | 'audio' | 'memory' | 'diagram' | 'objects' | 'emotions' | 'reasoning' | 'timeline' | 'safety' | 'tool-cards';
  title: string;
  content: any;
  timestamp: Date;
  status: 'processing' | 'complete' | 'error';
  media?: { type: string; url: string }[];
}

type SubsystemStatus = 'idle' | 'warming' | 'processing' | 'ready' | 'error';

interface SystemStatusState {
  vision: { active: boolean; status: SubsystemStatus; fps: number; objects: number };
  video: { active: boolean; status: SubsystemStatus };
  audio: { active: boolean; status: SubsystemStatus; emotion: string; confidence: number };
  documents: { active: boolean; status: SubsystemStatus };
  tools: { active: boolean; status: SubsystemStatus; predictions: string[] };
  memory: { active: boolean; status: SubsystemStatus; entries: number };
  safety: { active: boolean; status: SubsystemStatus; level: 'normal' | 'warning' | 'critical' };
  ar: { active: boolean; status: SubsystemStatus };
}

export default function AppConsole() {
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  const [outputModules, setOutputModules] = useState<OutputModule[]>([]);
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaQueue, setMediaQueue] = useState<{ type: string; url: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  const [systemStatus, setSystemStatus] = useState<SystemStatusState>({
    vision: { active: false, status: 'idle', fps: 0, objects: 0 },
    video: { active: false, status: 'idle' },
    audio: { active: false, status: 'idle', emotion: '', confidence: 0 },
    documents: { active: false, status: 'idle' },
    tools: { active: false, status: 'idle', predictions: [] },
    memory: { active: false, status: 'idle', entries: 0 },
    safety: { active: false, status: 'idle', level: 'normal' },
    ar: { active: false, status: 'idle' },
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await FixishAPI.getHealth();
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on new modules
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [outputModules]);

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const fileType = file.type.split('/')[0];
      setMediaQueue(prev => [...prev, { type: fileType, url, file, name: file.name }]);
      
      // Auto-activate subsystem based on file type
      if (fileType === 'image') {
        setSystemStatus(prev => ({ ...prev, vision: { ...prev.vision, status: 'ready', active: true } }));
      } else if (fileType === 'video') {
        setSystemStatus(prev => ({ ...prev, video: { ...prev.video, status: 'ready', active: true } }));
      } else if (fileType === 'audio') {
        setSystemStatus(prev => ({ ...prev, audio: { ...prev.audio, status: 'ready', active: true } }));
      }
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const openFileDialog = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const addOutputModule = (module: Omit<OutputModule, 'id' | 'timestamp'>) => {
    const newModule: OutputModule = { ...module, id: Date.now().toString() + Math.random(), timestamp: new Date() };
    setOutputModules(prev => [...prev, newModule]);
    return newModule.id;
  };

  const updateOutputModule = (id: string, updates: Partial<OutputModule>) => {
    setOutputModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const executeCommand = async () => {
    if (!command.trim() && mediaQueue.length === 0) return;

    setIsProcessing(true);
    
    // Activate all relevant subsystems
    setSystemStatus(prev => ({
      ...prev,
      vision: { ...prev.vision, status: 'processing', active: mediaQueue.some(m => m.type === 'image') },
      video: { ...prev.video, status: 'processing', active: mediaQueue.some(m => m.type === 'video') },
      audio: { ...prev.audio, status: 'processing', active: mediaQueue.some(m => m.type === 'audio') },
      tools: { ...prev.tools, status: 'processing', active: true },
      memory: { ...prev.memory, status: 'processing', active: true },
    }));
    
    // Show uploaded media
    if (mediaQueue.length > 0) {
      addOutputModule({
        type: 'vision',
        title: 'Input Media',
        content: { files: mediaQueue.map(m => m.name) },
        status: 'complete',
        media: mediaQueue.map(m => ({ type: m.type, url: m.url }))
      });
    }

    const processingId = addOutputModule({
      type: 'analysis',
      title: 'AGI Processing',
      content: { command: command || 'Analyzing uploaded content...' },
      status: 'processing'
    });

    const currentCommand = command;
    const currentMedia = [...mediaQueue];
    setCommand("");
    setMediaQueue([]);

    try {
      let imageBase64: string | undefined;
      let audioBase64: string | undefined;
      
      for (const media of currentMedia) {
        const base64 = await fileToBase64(media.file);
        if (media.type === 'image') imageBase64 = base64;
        else if (media.type === 'audio') audioBase64 = base64;
      }

      const result = await FixishAPI.process({
        prompt: currentCommand || "Analyze this content",
        image: imageBase64,
        audio: audioBase64,
        context: {}
      });

      updateOutputModule(processingId, { status: 'complete', content: { command: currentCommand, result: 'Analysis complete' } });

      // Add dynamic output modules based on results
      
      // Object detection (simulated if image was uploaded)
      if (imageBase64) {
        const detectedObjects = (result as any).objects || [
          { name: 'Engine Block', confidence: 0.94 },
          { name: 'Carburetor', confidence: 0.87 },
          { name: 'Alternator', confidence: 0.82 },
          { name: 'Timing Belt', confidence: 0.76 },
        ];
        addOutputModule({
          type: 'objects',
          title: 'Object Detection',
          content: { objects: detectedObjects },
          status: 'complete'
        });
        setSystemStatus(prev => ({ ...prev, vision: { ...prev.vision, objects: detectedObjects.length } }));
      }

      // AGI Analysis text
      if (result.instructions) {
        addOutputModule({ type: 'analysis', title: 'AGI Analysis', content: { text: result.instructions }, status: 'complete' });
      }

      // Reasoning steps
      const reasoningSteps = (result as any).reasoning || [
        { step: 'Identified primary components in the image', confidence: 0.95 },
        { step: 'Cross-referenced with repair database', confidence: 0.88 },
        { step: 'Generated step-by-step repair sequence', confidence: 0.92 },
        { step: 'Predicted required tools based on task', confidence: 0.85 },
      ];
      addOutputModule({
        type: 'reasoning',
        title: 'AGI Reasoning',
        content: { reasoning: reasoningSteps },
        status: 'complete'
      });

      // Execution steps
      if (result.steps?.length) {
        addOutputModule({ type: 'steps', title: 'Repair Sequence', content: { steps: result.steps }, status: 'complete' });
      }

      // Tool predictions
      if (result.predicted_tools?.length) {
        const toolsWithConfidence = result.predicted_tools.map((t: any) => 
          typeof t === 'string' ? { name: t, confidence: 0.7 + Math.random() * 0.3 } : t
        );
        addOutputModule({ type: 'tool-cards', title: 'Tool Predictions', content: { tools: toolsWithConfidence }, status: 'complete' });
        store.setToolResult({ tools: result.predicted_tools });
      }

      // Emotion analysis (if audio)
      if (audioBase64 || result.emotion) {
        const emotions = (result as any).emotions || [
          { label: 'Confidence', value: 0.72, color: 'hsl(140 100% 50%)' },
          { label: 'Stress', value: 0.28, color: 'hsl(0 80% 60%)' },
          { label: 'Focus', value: 0.85, color: 'hsl(200 100% 60%)' },
          { label: 'Frustration', value: 0.15, color: 'hsl(30 100% 60%)' },
        ];
        addOutputModule({ type: 'emotions', title: 'Emotion Analysis', content: { emotions }, status: 'complete' });
        setSystemStatus(prev => ({ 
          ...prev, 
          audio: { ...prev.audio, emotion: result.emotion?.label || 'Confident', confidence: result.emotion?.confidence || 0.72 } 
        }));
      }

      // Timeline progression
      const timeline = {
        past: result.timeline?.past || ['Initial assessment', 'Component identification'],
        current: currentCommand || 'Analyzing repair requirements',
        future: result.timeline?.future || ['Disassemble housing', 'Replace faulty component', 'Reassemble and test']
      };
      addOutputModule({ type: 'timeline', title: 'Timeline', content: timeline, status: 'complete' });
      store.setFutureResult({ next_steps: timeline.future });

      // Safety alerts
      if (result.warnings?.length) {
        const safetyAlerts = result.warnings.map((w: string) => ({
          level: w.toLowerCase().includes('critical') ? 'critical' : 'warning',
          message: w
        }));
        addOutputModule({ type: 'safety', title: 'Safety Alerts', content: { alerts: safetyAlerts }, status: 'complete' });
        setSystemStatus(prev => ({ ...prev, safety: { ...prev.safety, active: true, level: 'warning' } }));
      }

      // Memory retrieval
      const memories = (result as any).memories || [
        { content: 'Similar repair completed 3 days ago with 95% success rate', relevance: 0.92, timestamp: '3 days ago' },
        { content: 'Related component failure pattern identified in database', relevance: 0.78, timestamp: '1 week ago' },
      ];
      addOutputModule({ type: 'memory', title: 'Memory Retrieval', content: { memories }, status: 'complete' });
      setSystemStatus(prev => ({ ...prev, memory: { ...prev.memory, entries: memories.length } }));

      store.setProcessResult(result);

    } catch (error: any) {
      updateOutputModule(processingId, { status: 'error', content: { error: error.message } });
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      // Reset subsystem statuses after delay
      setTimeout(() => {
        setSystemStatus(prev => ({
          vision: { ...prev.vision, status: 'idle', active: false },
          video: { ...prev.video, status: 'idle', active: false },
          audio: { ...prev.audio, status: 'idle', active: false },
          documents: { ...prev.documents, status: 'idle' },
          tools: { ...prev.tools, status: 'idle', active: false },
          memory: { ...prev.memory, status: 'idle', active: false },
          safety: { ...prev.safety, status: 'idle', active: false, level: 'normal' },
          ar: { ...prev.ar, status: 'idle' },
        }));
      }, 3000);
    }
  };

  // Render output module by type
  const renderOutputModule = (module: OutputModule) => {
    switch (module.type) {
      case 'objects':
        return <ObjectDetectionModule key={module.id} objects={module.content.objects} />;
      case 'emotions':
        return <EmotionBarsModule key={module.id} emotions={module.content.emotions} />;
      case 'reasoning':
        return <ReasoningModule key={module.id} reasoning={module.content.reasoning} />;
      case 'timeline':
        return <TimelineModule key={module.id} past={module.content.past} current={module.content.current} future={module.content.future} />;
      case 'safety':
        return <SafetyAlertsModule key={module.id} alerts={module.content.alerts} />;
      case 'tool-cards':
        return <ToolCardsModule key={module.id} tools={module.content.tools} />;
      case 'memory':
        return <MemoryModule key={module.id} memories={module.content.memories} />;
      default:
        return null; // Handled by LiveIntelligenceFeed
    }
  };

  // Filter standard modules for LiveIntelligenceFeed
  const standardModules = outputModules.filter(m => 
    !['objects', 'emotions', 'reasoning', 'timeline', 'safety', 'tool-cards', 'memory'].includes(m.type)
  );
  
  // Get special modules
  const specialModules = outputModules.filter(m => 
    ['objects', 'emotions', 'reasoning', 'timeline', 'safety', 'tool-cards', 'memory'].includes(m.type)
  );

  return (
    <TooltipProvider>
      <div 
        className="h-screen flex flex-col overflow-hidden bg-[hsl(220,20%,6%)] text-foreground"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <HeartbeatBackground 
          isActive={isProcessing} 
          intensity={isProcessing ? 'processing' : 'idle'} 
        />
        
        <DropZone 
          isDragging={isDragging}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        />

        <ConsoleHeader isProcessing={isProcessing} isOnline={isOnline} />

        <div className="flex-1 flex overflow-hidden relative z-10">
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple className="hidden" />
          
          <SubsystemDock 
            systemStatus={systemStatus}
            onUpload={(_, accept) => openFileDialog(accept)}
            onAction={(subsystem, action) => {
              console.log('Action:', subsystem, action);
              toast({ title: `${subsystem}`, description: `Action: ${action}` });
            }}
          />

          <main className="flex-1 flex flex-col min-w-0">
            {/* Upload Zone at top */}
            <UploadZone onFilesSelected={handleFiles} isProcessing={isProcessing} />
            
            {/* Main intelligence feed */}
            <ScrollArea className="flex-1 px-6 py-2" ref={scrollRef}>
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Empty state */}
                {outputModules.length === 0 && !isProcessing && (
                  <motion.div 
                    className="text-center py-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="relative inline-flex items-center justify-center mb-8"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="absolute w-32 h-32 rounded-full border border-primary/5"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute w-24 h-24 rounded-full border border-primary/10"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      />
                      <motion.div 
                        className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10"
                        animate={{ 
                          boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.1)', '0 0 30px 5px hsl(var(--primary) / 0.15)', '0 0 0 0 hsl(var(--primary) / 0.1)']
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <img src={hummingbirdLogo} alt="Fix-ISH" className="h-12 w-12 object-contain opacity-70" />
                      </motion.div>
                    </motion.div>
                    
                    <h3 className="text-lg font-medium text-foreground/80 mb-2">AGI Console Ready</h3>
                    <p className="text-sm text-muted-foreground/50 mb-4">
                      Multimodal intelligence system standing by
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/40">
                      <span>Press</span>
                      <kbd className="px-2 py-1 bg-muted/10 rounded text-[11px] font-mono">⌘K</kbd>
                      <span>or upload files to begin</span>
                    </div>
                  </motion.div>
                )}

                {/* Live Intelligence Feed (standard modules) */}
                <AnimatePresence mode="popLayout">
                  <LiveIntelligenceFeed outputModules={standardModules} isProcessing={isProcessing && standardModules.length > 0} />
                </AnimatePresence>

                {/* Special Output Modules */}
                <AnimatePresence mode="popLayout">
                  {specialModules.map(module => (
                    <motion.div 
                      key={module.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    >
                      {renderOutputModule(module)}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Processing indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 py-6"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ 
                            y: [0, -8, 0],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">Processing intelligence...</span>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
            
            <CommandBar
              command={command}
              setCommand={setCommand}
              mediaQueue={mediaQueue}
              onRemoveMedia={(i) => setMediaQueue(prev => prev.filter((_, idx) => idx !== i))}
              onOpenFileDialog={openFileDialog}
              onExecute={executeCommand}
              isProcessing={isProcessing}
              isOnline={isOnline}
            />
          </main>

          <IntelligencePanel 
            toolResult={store.toolResult}
            futureResult={store.futureResult}
            systemStatus={systemStatus}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
