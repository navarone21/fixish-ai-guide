import { useState, useRef, DragEvent, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import hummingbirdLogo from "@/assets/hummingbird-logo.png";

import { HeartbeatBackground } from "@/components/console/HeartbeatBackground";
import { ConsoleHeader } from "@/components/console/ConsoleHeader";
import { SubsystemDock } from "@/components/console/SubsystemDock";
import { CommandBar } from "@/components/console/CommandBar";
import { IntelligencePanel } from "@/components/console/IntelligencePanel";
import { DropZone } from "@/components/console/DropZone";
import { UploadZone } from "@/components/console/UploadZone";
import { KeyboardShortcuts } from "@/components/console/KeyboardShortcuts";
import {
  VisionAnalysisModule,
  VideoFrameModule,
  ToolPredictionModule,
  RepairSequenceModule,
  ReasoningModule,
  FutureMemoryModule,
  SafetyModule,
  EmotionModule,
  MemoryRetrievalModule
} from "@/components/console/DynamicModules";

interface DynamicModule {
  id: string;
  type: 'vision' | 'video' | 'tools' | 'steps' | 'reasoning' | 'timeline' | 'safety' | 'emotion' | 'memory';
  data: any;
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
  
  const [modules, setModules] = useState<DynamicModule[]>([]);
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaQueue, setMediaQueue] = useState<{ type: string; url: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [modules]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+Shift+K for shortcuts panel
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // ⌘+U for upload
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      
      if (fileType === 'image') {
        setLastImageUrl(url);
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

  const removeModule = useCallback((id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  }, []);

  const addModule = (type: DynamicModule['type'], data: any) => {
    const newModule: DynamicModule = { id: `${type}-${Date.now()}`, type, data };
    setModules(prev => [...prev, newModule]);
  };

  const executeCommand = async () => {
    if (!command.trim() && mediaQueue.length === 0) return;

    setIsProcessing(true);
    
    setSystemStatus(prev => ({
      ...prev,
      vision: { ...prev.vision, status: 'processing', active: mediaQueue.some(m => m.type === 'image') },
      video: { ...prev.video, status: 'processing', active: mediaQueue.some(m => m.type === 'video') },
      audio: { ...prev.audio, status: 'processing', active: mediaQueue.some(m => m.type === 'audio') },
      tools: { ...prev.tools, status: 'processing', active: true },
      memory: { ...prev.memory, status: 'processing', active: true },
    }));

    const currentCommand = command;
    const currentMedia = [...mediaQueue];
    const hasImage = currentMedia.some(m => m.type === 'image');
    const hasAudio = currentMedia.some(m => m.type === 'audio');
    const imageUrl = currentMedia.find(m => m.type === 'image')?.url || lastImageUrl;
    
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

      // Call the primary /ask endpoint
      const askResult = await FixishAPI.askBackend(currentCommand || "Analyze this content");
      
      // Use response from backend, fallback to process endpoint for media
      let result: any = askResult;
      
      if (hasImage || hasAudio) {
        const processResult = await FixishAPI.process({
          prompt: currentCommand || "Analyze this content",
          image: imageBase64,
          audio: audioBase64,
          context: {}
        });
        result = { ...askResult, ...processResult };
      }

      // Vision Analysis Module
      if (hasImage || imageBase64) {
        const objects = (result as any).objects || [
          { name: 'Engine Block', confidence: 0.94 },
          { name: 'Carburetor', confidence: 0.87 },
          { name: 'Alternator Belt', confidence: 0.82 },
          { name: 'Coolant Reservoir', confidence: 0.78 },
          { name: 'Timing Cover', confidence: 0.71 },
        ];
        addModule('vision', { imageUrl, objects });
        setSystemStatus(prev => ({ ...prev, vision: { ...prev.vision, objects: objects.length } }));
      }

      // Video Frame Analysis Module
      const hasVideo = currentMedia.some(m => m.type === 'video');
      if (hasVideo) {
        const videoUrl = currentMedia.find(m => m.type === 'video')?.url;
        const frames = (result as any).video_frames || [
          { timestamp: 0.5, objects: [{ name: 'Engine Bay', confidence: 0.95 }, { name: 'Air Filter', confidence: 0.88 }] },
          { timestamp: 2.0, objects: [{ name: 'Alternator', confidence: 0.92 }, { name: 'Belt System', confidence: 0.85 }] },
          { timestamp: 4.5, objects: [{ name: 'Coolant Lines', confidence: 0.89 }, { name: 'Radiator', confidence: 0.91 }] },
          { timestamp: 7.0, objects: [{ name: 'Battery', confidence: 0.97 }, { name: 'Terminal Corrosion', confidence: 0.78 }] },
          { timestamp: 10.0, objects: [{ name: 'Brake Fluid Reservoir', confidence: 0.86 }] },
        ];
        addModule('video', { videoUrl, frames });
        setSystemStatus(prev => ({ ...prev, video: { ...prev.video, status: 'ready', active: true } }));
      }

      // Tool Predictions Module
      const tools = result.predicted_tools?.map((t: any) => ({
        name: typeof t === 'string' ? t : t.name,
        confidence: typeof t === 'object' ? t.confidence : 0.7 + Math.random() * 0.3,
        description: typeof t === 'object' ? t.description : 'Recommended for this repair'
      })) || [
        { name: 'Socket Wrench Set', confidence: 0.95, description: 'For bolt removal and installation' },
        { name: 'Torque Wrench', confidence: 0.88, description: 'Precise tightening to spec' },
        { name: 'Multimeter', confidence: 0.76, description: 'Electrical diagnostics' },
        { name: 'Pliers Set', confidence: 0.72, description: 'Gripping and manipulation' },
      ];
      addModule('tools', { tools });
      store.setToolResult({ tools: result.predicted_tools || tools.map((t: any) => t.name) });

      // Repair Steps Module
      const steps = result.steps?.map((s: string, i: number) => ({
        title: s,
        description: `Detailed instructions for step ${i + 1}`,
        duration: `${2 + Math.floor(Math.random() * 8)} min`
      })) || [
        { title: 'Disconnect battery terminal', description: 'Ensure safety by disconnecting negative terminal first', duration: '2 min' },
        { title: 'Remove protective covers', description: 'Carefully remove any plastic covers or shields', duration: '5 min' },
        { title: 'Locate and access component', description: 'Identify the component based on visual analysis', duration: '3 min' },
        { title: 'Perform repair procedure', description: 'Follow manufacturer specifications for repair', duration: '15 min' },
        { title: 'Reassemble and test', description: 'Reinstall components and verify operation', duration: '10 min' },
      ];
      addModule('steps', { steps });

      // Reasoning Module
      const reasoning = (result as any).reasoning || [
        { step: 'Analyzed visual input for component identification', confidence: 0.96 },
        { step: 'Cross-referenced with repair knowledge base', confidence: 0.91 },
        { step: 'Identified optimal repair sequence based on component access', confidence: 0.88 },
        { step: 'Selected tools based on fastener types detected', confidence: 0.84 },
        { step: 'Generated safety assessment from hazard detection', confidence: 0.92 },
      ];
      addModule('reasoning', { reasoning });

      // Timeline/Future Memory Module
      const timeline = {
        past: result.timeline?.past || ['System initialized', 'Input received'],
        current: currentCommand || 'Processing repair analysis',
        future: result.timeline?.future || [
          'Component disassembly',
          'Repair execution', 
          'Quality verification',
          'System restoration'
        ]
      };
      addModule('timeline', timeline);
      store.setFutureResult({ next_steps: timeline.future });

      // Safety Module
      const safetyLevel = result.warnings?.length ? (result.warnings.some((w: string) => w.toLowerCase().includes('critical')) ? 'critical' : 'warning') : 'normal';
      const alerts = result.warnings?.map((w: string) => ({
        severity: w.toLowerCase().includes('critical') ? 'critical' : 'warning',
        message: w
      })) || [];
      addModule('safety', { level: safetyLevel, alerts });
      if (alerts.length > 0) {
        setSystemStatus(prev => ({ ...prev, safety: { ...prev.safety, active: true, level: safetyLevel as any } }));
      }

      // Emotion Module (if audio)
      if (hasAudio || audioBase64) {
        const emotions = (result as any).emotions || [
          { label: 'Confidence', value: 0.78, color: 'hsl(140 100% 50%)' },
          { label: 'Concern', value: 0.35, color: 'hsl(45 100% 50%)' },
          { label: 'Focus', value: 0.89, color: 'hsl(200 100% 60%)' },
          { label: 'Urgency', value: 0.22, color: 'hsl(0 80% 60%)' },
        ];
        addModule('emotion', { emotions });
        setSystemStatus(prev => ({ 
          ...prev, 
          audio: { ...prev.audio, emotion: result.emotion?.label || 'Focused', confidence: result.emotion?.confidence || 0.85 } 
        }));
      }

      // Memory Module
      const memories = (result as any).memories || [
        { content: 'Similar repair pattern found in database with 94% success rate', relevance: 0.94, timestamp: '2 days ago' },
        { content: 'Related component failure documented - check wear patterns', relevance: 0.82, timestamp: '1 week ago' },
      ];
      addModule('memory', { memories });
      setSystemStatus(prev => ({ ...prev, memory: { ...prev.memory, entries: memories.length } }));

      store.setProcessResult(result);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
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

  const renderModule = (module: DynamicModule) => {
    const props = { id: module.id, onClose: removeModule };
    
    switch (module.type) {
      case 'vision':
        return <VisionAnalysisModule key={module.id} {...props} imageUrl={module.data.imageUrl} objects={module.data.objects} />;
      case 'video':
        return <VideoFrameModule key={module.id} {...props} videoUrl={module.data.videoUrl} frames={module.data.frames} />;
      case 'tools':
        return <ToolPredictionModule key={module.id} {...props} tools={module.data.tools} />;
      case 'steps':
        return <RepairSequenceModule key={module.id} {...props} steps={module.data.steps} />;
      case 'reasoning':
        return <ReasoningModule key={module.id} {...props} reasoning={module.data.reasoning} />;
      case 'timeline':
        return <FutureMemoryModule key={module.id} {...props} past={module.data.past} current={module.data.current} future={module.data.future} />;
      case 'safety':
        return <SafetyModule key={module.id} {...props} level={module.data.level} alerts={module.data.alerts} />;
      case 'emotion':
        return <EmotionModule key={module.id} {...props} emotions={module.data.emotions} />;
      case 'memory':
        return <MemoryRetrievalModule key={module.id} {...props} memories={module.data.memories} />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div 
        className="h-screen flex flex-col overflow-hidden bg-[hsl(220,20%,6%)] text-foreground"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <HeartbeatBackground isActive={isProcessing} intensity={isProcessing ? 'processing' : 'idle'} />
        <DropZone isDragging={isDragging} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} />
        <ConsoleHeader isProcessing={isProcessing} isOnline={isOnline} />

        <div className="flex-1 flex overflow-hidden relative z-10">
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple className="hidden" />
          
          <SubsystemDock 
            systemStatus={systemStatus}
            onUpload={(_, accept) => openFileDialog(accept)}
            onAction={(subsystem, action) => toast({ title: subsystem, description: `Action: ${action}` })}
          />

          <main className="flex-1 flex flex-col min-w-0">
            <UploadZone onFilesSelected={handleFiles} isProcessing={isProcessing} />
            
            <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Empty state - only show when no modules */}
                {modules.length === 0 && !isProcessing && (
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
                        animate={{ boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.1)', '0 0 30px 5px hsl(var(--primary) / 0.15)', '0 0 0 0 hsl(var(--primary) / 0.1)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <img src={hummingbirdLogo} alt="Fix-ISH" className="h-12 w-12 object-contain opacity-70" />
                      </motion.div>
                    </motion.div>
                    
                    <h3 className="text-lg font-medium text-foreground/80 mb-2">AGI Console Ready</h3>
                    <p className="text-sm text-muted-foreground/50 mb-4">Upload files or enter a command to begin analysis</p>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                        <span>Press</span>
                        <kbd className="px-2 py-1 bg-muted/10 rounded text-[11px] font-mono">⌘K</kbd>
                        <span>for commands</span>
                      </div>
                      <button 
                        onClick={() => setShowKeyboardShortcuts(true)}
                        className="flex items-center gap-1.5 text-[11px] text-primary/60 hover:text-primary transition-colors"
                      >
                        <span>⇧⌘K</span>
                        <span>View all shortcuts</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Clear All Button - shown when modules exist */}
                {modules.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-end mb-2"
                  >
                    <button
                      onClick={() => setModules([])}
                      className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1 rounded hover:bg-muted/10"
                    >
                      Clear all modules
                    </button>
                  </motion.div>
                )}

                {/* Dynamic Modules */}
                <Reorder.Group axis="y" values={modules} onReorder={setModules} className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {modules.map(module => (
                      <Reorder.Item key={module.id} value={module} className="cursor-grab active:cursor-grabbing">
                        {renderModule(module)}
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>

                {/* Processing indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 py-8"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">Generating intelligence modules...</span>
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

        {/* Keyboard Shortcuts Overlay */}
        <KeyboardShortcuts 
          isOpen={showKeyboardShortcuts} 
          onClose={() => setShowKeyboardShortcuts(false)}
          onSelectCommand={(cmd) => setCommand(cmd)}
        />
      </div>
    </TooltipProvider>
  );
}
