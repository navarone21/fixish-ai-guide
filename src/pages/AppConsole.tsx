import { useState, useRef, useEffect, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Send, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Wrench,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  ChevronRight,
  Bot,
  User,
  Eye,
  Shield,
  Cpu,
  Camera,
  Brain,
  Zap,
  ArrowLeft,
  Plus,
  Monitor,
  FileUp,
  Waves
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: { type: string; url: string; name?: string }[];
  steps?: string[];
  tools?: string[];
  warnings?: string[];
  reasoning?: string;
  futureMemory?: string[];
  emotion?: { label: string; confidence: number };
  isExpanded?: boolean;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function AppConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  const [showIntelligence, setShowIntelligence] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaQueue, setMediaQueue] = useState<{ type: string; url: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  
  const [status, setStatus] = useState({ vision: false, tools: false, memory: false, safety: false });
  const [isOnline, setIsOnline] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const checkHealth = async () => {
    try {
      await FixishAPI.getHealth();
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = (files: FileList | null, type?: string) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const fileType = type || file.type.split('/')[0];
      setMediaQueue(prev => [...prev, { type: fileType, url, file, name: file.name }]);
    });
    setAttachOpen(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          setMediaQueue(prev => [...prev, { type: 'image', url, file, name: 'Pasted image' }]);
        }
      }
    }
  };

  const removeMedia = (index: number) => {
    setMediaQueue(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleSend = async () => {
    if (!input.trim() && mediaQueue.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "",
      timestamp: new Date(),
      media: mediaQueue.map(m => ({ type: m.type, url: m.url, name: m.name }))
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentMedia = [...mediaQueue];
    setInput("");
    setMediaQueue([]);
    setIsLoading(true);
    
    const hasImage = currentMedia.some(m => m.type === 'image');
    const hasAudio = currentMedia.some(m => m.type === 'audio');
    const hasVideo = currentMedia.some(m => m.type === 'video');
    
    setStatus({ 
      vision: hasImage || hasVideo, 
      tools: true, 
      memory: true, 
      safety: true
    });

    try {
      let imageBase64: string | undefined;
      let audioBase64: string | undefined;
      
      for (const media of currentMedia) {
        const base64 = await fileToBase64(media.file);
        if (media.type === 'image') imageBase64 = base64;
        else if (media.type === 'audio') audioBase64 = base64;
      }

      const result = await FixishAPI.process({
        prompt: currentInput || "Analyze this content",
        image: imageBase64,
        audio: audioBase64,
        context: { messages: messages.slice(-5) }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.instructions || "Analysis complete.",
        timestamp: new Date(),
        steps: result.steps,
        tools: result.predicted_tools,
        warnings: result.warnings,
        reasoning: result.agent_messages?.join(" ") || undefined,
        futureMemory: result.timeline?.future?.map((f: any) => typeof f === 'string' ? f : JSON.stringify(f)),
        emotion: result.emotion,
        isExpanded: false
      };

      setMessages(prev => [...prev, assistantMessage]);
      store.setProcessResult(result);
      
      if (result.predicted_tools) {
        store.setToolResult({ tools: result.predicted_tools });
      }
      if (result.timeline?.future) {
        store.setFutureResult({ next_steps: result.timeline.future });
      }
    } catch (error: any) {
      toast({ title: "Connection Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ vision: false, tools: false, memory: false, safety: false }), 1500);
    }
  };

  const toggleMessageExpanded = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  // Minimal status indicator
  const StatusDot = ({ active, icon: Icon }: { active: boolean; icon: any }) => (
    <motion.div 
      className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${
        active ? 'bg-primary/20' : 'bg-transparent'
      }`}
      animate={active ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
    >
      <Icon className={`h-3 w-3 ${active ? 'text-primary' : 'text-muted-foreground/30'}`} />
    </motion.div>
  );

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden bg-background"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Minimal Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/20 bg-background/80 backdrop-blur-xl shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <motion.div
              className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center"
              animate={isLoading ? { boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.4)', '0 0 0 6px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.4)'] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="h-3.5 w-3.5 text-primary" />
            </motion.div>
            <span className="text-sm font-medium">Fix-ISH</span>
          </div>
        </div>
        
        {/* Status indicators - only location */}
        <div className="flex items-center gap-0.5 bg-muted/30 rounded-full px-1 py-1">
          <StatusDot active={status.vision} icon={Eye} />
          <StatusDot active={status.tools} icon={Wrench} />
          <StatusDot active={status.memory} icon={Cpu} />
          <StatusDot active={status.safety} icon={Shield} />
        </div>

        <div className="flex items-center gap-3">
          {/* AGI Status chip */}
          <motion.div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
              isLoading 
                ? 'bg-primary/10 text-primary' 
                : isOnline 
                  ? 'bg-muted/40 text-muted-foreground' 
                  : 'bg-destructive/10 text-destructive'
            }`}
            animate={isLoading ? { opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-primary' : isOnline ? 'bg-emerald-500' : 'bg-destructive'}`} />
            {isLoading ? 'Processing' : isOnline ? 'Ready' : 'Offline'}
          </motion.div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowIntelligence(!showIntelligence)}
            className="h-8 w-8 rounded-xl"
          >
            <Zap className={`h-4 w-4 ${showIntelligence ? 'text-primary' : 'text-muted-foreground'}`} />
          </Button>
        </div>
      </header>

      {/* Drop overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-4 z-50 bg-primary/5 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl"
          >
            <div className="text-center">
              <FileUp className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-primary">Drop files here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 px-6 py-8" ref={scrollRef}>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Clean Idle State */}
              {messages.length === 0 && !isLoading && (
                <motion.div 
                  className="text-center py-32"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="relative inline-flex items-center justify-center mb-8"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="absolute w-20 h-20 rounded-full border border-primary/10"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-primary/60" />
                    </div>
                  </motion.div>
                  
                  <p className="text-sm text-muted-foreground/50">Ready for Multimodal Analysis</p>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    layout
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Media */}
                      {msg.media && msg.media.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.media.map((m, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-border/20">
                              {m.type === 'image' && <img src={m.url} alt="" className="max-h-40 object-cover" />}
                              {m.type === 'video' && <video src={m.url} controls className="max-h-40" />}
                              {m.type === 'audio' && <audio src={m.url} controls className="w-48" />}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      {msg.content && (
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-br-lg' 
                            : 'bg-muted/50 rounded-bl-lg'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      )}

                      {/* Expandable details */}
                      {msg.role === 'assistant' && (msg.steps || msg.tools || msg.reasoning || msg.warnings || msg.futureMemory || msg.emotion) && (
                        <div className="space-y-2 w-full">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleMessageExpanded(msg.id)}
                            className="h-7 text-[10px] text-muted-foreground gap-1 px-2 rounded-lg"
                          >
                            <motion.div animate={{ rotate: msg.isExpanded ? 90 : 0 }}>
                              <ChevronRight className="h-3 w-3" />
                            </motion.div>
                            Details
                          </Button>

                          <AnimatePresence>
                            {msg.isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-2"
                              >
                                {msg.reasoning && (
                                  <div className="bg-muted/30 rounded-xl p-3">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-1">Reasoning</p>
                                    <p className="text-xs text-muted-foreground">{msg.reasoning}</p>
                                  </div>
                                )}

                                {msg.steps && msg.steps.length > 0 && (
                                  <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Steps</p>
                                    {msg.steps.map((step, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <span className="text-primary text-[10px]">{i + 1}.</span>
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {msg.tools && msg.tools.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {msg.tools.map((tool, i) => (
                                      <Badge key={i} variant="secondary" className="text-[9px] bg-primary/5 text-primary border-0">{tool}</Badge>
                                    ))}
                                  </div>
                                )}

                                {msg.warnings && msg.warnings.length > 0 && (
                                  <div className="space-y-1">
                                    {msg.warnings.map((w, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/5 rounded-lg px-3 py-2">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>{w}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {msg.emotion && (
                                  <div className="flex items-center gap-2">
                                    <Waves className="h-3 w-3 text-primary" />
                                    <Badge variant="outline" className="text-[9px]">{msg.emotion.label}</Badge>
                                    <span className="text-[9px] text-muted-foreground">{Math.round(msg.emotion.confidence * 100)}%</span>
                                  </div>
                                )}

                                {msg.futureMemory && msg.futureMemory.length > 0 && (
                                  <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Future</p>
                                    {msg.futureMemory.slice(0, 3).map((f, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-2xl rounded-bl-lg px-4 py-2.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Clean Input Bar */}
          <div className="p-6 pt-0">
            <div className="max-w-2xl mx-auto">
              {/* Media queue */}
              <AnimatePresence>
                {mediaQueue.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-wrap gap-2 mb-3"
                  >
                    {mediaQueue.map((media, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        className="relative group"
                      >
                        <div className="h-16 w-16 rounded-lg overflow-hidden border border-border/20 bg-muted/30">
                          {media.type === 'image' && <img src={media.url} alt="" className="h-full w-full object-cover" />}
                          {media.type === 'video' && (
                            <div className="h-full w-full flex items-center justify-center bg-muted/50">
                              <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          {media.type === 'audio' && (
                            <div className="h-full w-full flex items-center justify-center bg-muted/50">
                              <Mic className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeMedia(i)}
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="flex items-end gap-2 bg-muted/30 rounded-2xl border border-border/20 p-2 focus-within:border-primary/30 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  className="hidden"
                />
                
                {/* Single + button with popover */}
                <Popover open={attachOpen} onOpenChange={setAttachOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-48 p-2">
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9 text-xs"
                        onClick={() => openFileDialog('*/*')}
                      >
                        <FileUp className="h-3.5 w-3.5" />
                        Upload file
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9 text-xs"
                        onClick={() => openFileDialog('image/*')}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Upload photo
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9 text-xs"
                        onClick={() => openFileDialog('video/*')}
                      >
                        <Video className="h-3.5 w-3.5" />
                        Upload video
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9 text-xs"
                        onClick={() => openFileDialog('audio/*')}
                      >
                        <Mic className="h-3.5 w-3.5" />
                        Record audio
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9 text-xs text-muted-foreground/50"
                        disabled
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Camera
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9 text-xs text-muted-foreground/50"
                        disabled
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        Screen capture
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="Message Fix-ISH..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none text-sm placeholder:text-muted-foreground/40 focus:outline-none min-h-[36px] max-h-28 py-2"
                />

                <Button 
                  onClick={handleSend}
                  disabled={isLoading || !isOnline || (!input.trim() && mediaQueue.length === 0)}
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
              
              {/* Live AR chip */}
              <div className="flex justify-center mt-3">
                <motion.div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/20 text-[10px] text-muted-foreground/50"
                  animate={{ opacity: [0.5, 0.7, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="h-2.5 w-2.5" />
                  Live AR: Initializing
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Only Tool Predictions & Future Memory */}
        <AnimatePresence>
          {showIntelligence && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="border-l border-border/20 bg-muted/5 overflow-hidden shrink-0"
            >
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Tool Predictions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">Tool Predictions</span>
                    </div>
                    {store.toolResult?.tools && store.toolResult.tools.length > 0 ? (
                      <div className="space-y-3">
                        {(Array.isArray(store.toolResult.tools) ? store.toolResult.tools : []).slice(0, 5).map((tool: any, i: number) => {
                          const name = typeof tool === 'string' ? tool : tool.name || tool.tool;
                          const conf = typeof tool === 'object' && tool.confidence ? tool.confidence : 70 + Math.random() * 30;
                          return (
                            <motion.div 
                              key={i} 
                              className="space-y-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">{name}</span>
                                <span className="text-foreground">{Math.round(conf)}%</span>
                              </div>
                              <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${conf}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.1 }}
                                  className="h-full bg-primary/60 rounded-full"
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/40">No predictions yet</p>
                    )}
                  </div>

                  <div className="h-px bg-border/10" />

                  {/* Future Memory */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">Future Memory</span>
                    </div>
                    {store.futureResult?.next_steps && store.futureResult.next_steps.length > 0 ? (
                      <div className="space-y-2">
                        {store.futureResult.next_steps.slice(0, 5).map((step: any, i: number) => {
                          const stepText = typeof step === 'string' ? step : step.label || JSON.stringify(step);
                          return (
                            <motion.div 
                              key={i} 
                              className="flex items-start gap-2 text-[11px] text-muted-foreground"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{stepText}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/40">No predictions yet</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
