import { useState, useRef, DragEvent } from "react";
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

interface OutputModule {
  id: string;
  type: 'analysis' | 'steps' | 'tools' | 'warning' | 'vision' | 'audio' | 'memory' | 'diagram';
  title: string;
  content: any;
  timestamp: Date;
  status: 'processing' | 'complete' | 'error';
  media?: { type: string; url: string }[];
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
  
  const [systemStatus, setSystemStatus] = useState({
    vision: { active: false, status: 'idle' as const, fps: 0, objects: 0 },
    video: { active: false, status: 'idle' as const },
    audio: { active: false, status: 'idle' as const, emotion: '', confidence: 0 },
    documents: { active: false, status: 'idle' as const },
    tools: { active: false, status: 'idle' as const, predictions: [] as string[] },
    memory: { active: false, status: 'idle' as const, entries: 0 },
    safety: { active: false, status: 'idle' as const, level: 'normal' as 'normal' | 'warning' | 'critical' },
    ar: { active: false, status: 'idle' as const },
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newModule: OutputModule = { ...module, id: Date.now().toString(), timestamp: new Date() };
    setOutputModules(prev => [...prev, newModule]);
    return newModule.id;
  };

  const updateOutputModule = (id: string, updates: Partial<OutputModule>) => {
    setOutputModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const executeCommand = async () => {
    if (!command.trim() && mediaQueue.length === 0) return;

    setIsProcessing(true);
    
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
      title: 'Processing Request',
      content: { command: command || 'Analyzing media...' },
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

      if (result.instructions) {
        addOutputModule({ type: 'analysis', title: 'AGI Analysis', content: { text: result.instructions }, status: 'complete' });
      }
      if (result.steps?.length) {
        addOutputModule({ type: 'steps', title: 'Execution Steps', content: { steps: result.steps }, status: 'complete' });
      }
      if (result.predicted_tools?.length) {
        addOutputModule({ type: 'tools', title: 'Tool Predictions', content: { tools: result.predicted_tools }, status: 'complete' });
        store.setToolResult({ tools: result.predicted_tools });
      }
      if (result.warnings?.length) {
        addOutputModule({ type: 'warning', title: 'Safety Warnings', content: { warnings: result.warnings }, status: 'complete' });
      }
      if (result.timeline?.future) {
        addOutputModule({ type: 'memory', title: 'Future Memory', content: { predictions: result.timeline.future }, status: 'complete' });
        store.setFutureResult({ next_steps: result.timeline.future });
      }
      store.setProcessResult(result);

    } catch (error: any) {
      updateOutputModule(processingId, { status: 'error', content: { error: error.message } });
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
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
            onAction={(subsystem, action) => console.log('Action:', subsystem, action)}
          />

          <main className="flex-1 flex flex-col min-w-0">
            <LiveIntelligenceFeed outputModules={outputModules} isProcessing={isProcessing} />
            
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
