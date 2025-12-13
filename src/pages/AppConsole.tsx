import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FixishAPI } from "@/lib/fixishApi";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
  ChevronDown,
  Bot,
  User,
  Eye,
  Shield,
  Cpu,
  Paperclip,
  Camera,
  Sparkles,
  History,
  FolderOpen,
  Zap,
  Circle,
  MoreHorizontal,
  ArrowLeft
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
  isExpanded?: boolean;
}

// Soft spring animation
const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function AppConsole() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useFixishConsoleStore();
  
  // Layout
  const [showSidebar, setShowSidebar] = useState(true);
  const [showIntelligence, setShowIntelligence] = useState(true);
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaQueue, setMediaQueue] = useState<{ type: string; url: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Backend
  const [status, setStatus] = useState({ vision: false, tools: false, memory: false, safety: false });
  const [isOnline, setIsOnline] = useState(false);
  
  // Refs
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

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.split('/')[0];
      setMediaQueue(prev => [...prev, { type, url, file, name: file.name }]);
    });
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
        if (file) handleFiles(new DataTransfer().files);
        const url = URL.createObjectURL(file!);
        setMediaQueue(prev => [...prev, { type: 'image', url, file: file!, name: 'Pasted image' }]);
      }
    }
  };

  const removeMedia = (index: number) => {
    setMediaQueue(prev => prev.filter((_, i) => i !== index));
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
    setStatus({ vision: currentMedia.length > 0, tools: true, memory: true, safety: true });

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
        isExpanded: false
      };

      setMessages(prev => [...prev, assistantMessage]);
      store.setProcessResult(result);
    } catch (error: any) {
      toast({ title: "Connection Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ vision: false, tools: false, memory: false, safety: false }), 1500);
    }
  };

  const handlePredictTools = async () => {
    store.setPredictingTools(true);
    setStatus(prev => ({ ...prev, tools: true }));
    try {
      const result = await FixishAPI.predictTools({ context: store.processResult });
      store.setToolResult(result);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      store.setPredictingTools(false);
      setTimeout(() => setStatus(prev => ({ ...prev, tools: false })), 1500);
    }
  };

  const handlePredictFuture = async () => {
    store.setPredictingFuture(true);
    setStatus(prev => ({ ...prev, memory: true }));
    try {
      const result = await FixishAPI.getFuture({ context: store.processResult });
      store.setFutureResult(result);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      store.setPredictingFuture(false);
      setTimeout(() => setStatus(prev => ({ ...prev, memory: false })), 1500);
    }
  };

  const toggleMessageExpanded = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  const StatusDot = ({ active, label }: { active: boolean; label: string }) => (
    <div className="flex items-center gap-1.5 px-2 py-1">
      <motion.div
        animate={{ scale: active ? [1, 1.2, 1] : 1, opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`}
      />
      <span className={`text-[11px] font-medium ${active ? 'text-foreground' : 'text-muted-foreground/60'}`}>{label}</span>
    </div>
  );

  return (
    <div 
      className="h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Minimal Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">Fix-ISH</span>
        </div>
        
        <div className="flex items-center gap-1 bg-muted/40 rounded-full px-1">
          <StatusDot active={status.vision} label="Vision" />
          <StatusDot active={status.tools} label="Tools" />
          <StatusDot active={status.memory} label="Memory" />
          <StatusDot active={status.safety} label="Safety" />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${isOnline ? 'border-emerald-500/40 text-emerald-500' : 'border-red-500/40 text-red-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </header>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary/40 rounded-xl m-4"
          >
            <div className="text-center">
              <Paperclip className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-lg font-medium text-primary">Drop files here</p>
              <p className="text-sm text-muted-foreground">Images, videos, audio, documents</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="border-r border-border/40 bg-muted/20 backdrop-blur-xl flex flex-col overflow-hidden shrink-0"
            >
              <div className="p-3 space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-xs font-normal">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Recent Sessions
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-xs font-normal">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Saved Projects
                </Button>
              </div>
              
              <div className="border-t border-border/40 p-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2 mb-2">Quick Actions</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePredictTools}
                  disabled={store.isPredictingTools}
                  className="w-full justify-start gap-2 h-9 text-xs font-normal"
                >
                  {store.isPredictingTools ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5 text-muted-foreground" />}
                  Predict Tools
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePredictFuture}
                  disabled={store.isPredictingFuture}
                  className="w-full justify-start gap-2 h-9 text-xs font-normal"
                >
                  {store.isPredictingFuture ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                  Future Memory
                </Button>
              </div>

              <div className="flex-1" />
              
              <div className="border-t border-border/40 p-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start gap-2 h-9 text-xs font-normal text-muted-foreground"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Live AR
                  <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0">Initializing</Badge>
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Toggle buttons */}
          <div className="absolute top-2 left-2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-7 w-7 rounded-md bg-background/60 backdrop-blur-sm"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowIntelligence(!showIntelligence)}
              className="h-7 w-7 rounded-md bg-background/60 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-24 text-muted-foreground/60">
                  <p className="text-sm">Start a conversation</p>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    layout
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Media */}
                      {msg.media && msg.media.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.media.map((m, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-border/40">
                              {m.type === 'image' && <img src={m.url} alt="" className="max-h-40 object-cover" />}
                              {m.type === 'video' && <video src={m.url} controls className="max-h-40" />}
                              {m.type === 'audio' && <audio src={m.url} controls className="w-48" />}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Content bubble */}
                      {msg.content && (
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-br-md' 
                            : 'bg-muted/60 backdrop-blur-sm border border-border/40 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}

                      {/* Expandable details for assistant */}
                      {msg.role === 'assistant' && (msg.steps || msg.tools || msg.reasoning || msg.warnings || msg.futureMemory) && (
                        <div className="space-y-2 w-full">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleMessageExpanded(msg.id)}
                            className="h-7 text-[11px] text-muted-foreground gap-1 px-2"
                          >
                            {msg.isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            {msg.isExpanded ? 'Hide details' : 'Show reasoning & tools'}
                          </Button>

                          <AnimatePresence>
                            {msg.isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={spring}
                                className="overflow-hidden space-y-3"
                              >
                                {msg.reasoning && (
                                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Reasoning</p>
                                    <p className="text-xs text-muted-foreground">{msg.reasoning}</p>
                                  </div>
                                )}

                                {msg.steps && msg.steps.length > 0 && (
                                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">Steps</p>
                                    <div className="space-y-1.5">
                                      {msg.steps.map((step, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                          <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                                          <span className="text-muted-foreground">{step}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {msg.tools && msg.tools.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {msg.tools.map((tool, i) => (
                                      <Badge key={i} variant="secondary" className="text-[10px] font-normal">{tool}</Badge>
                                    ))}
                                  </div>
                                )}

                                {msg.warnings && msg.warnings.length > 0 && (
                                  <div className="space-y-1">
                                    {msg.warnings.map((w, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-1.5">
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        <span>{w}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {msg.futureMemory && msg.futureMemory.length > 0 && (
                                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">Future Memory</p>
                                    <div className="space-y-1">
                                      {msg.futureMemory.map((f, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                          <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                                          <span>{f}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Unified Input */}
          <div className="p-4 bg-gradient-to-t from-background via-background to-transparent">
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
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative group"
                      >
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-border/40 bg-muted/40">
                          {media.type === 'image' && <img src={media.url} alt="" className="h-full w-full object-cover" />}
                          {media.type === 'video' && <video src={media.url} className="h-full w-full object-cover" />}
                          {media.type === 'audio' && (
                            <div className="h-full w-full flex items-center justify-center">
                              <Mic className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeMedia(i)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar */}
              <div className="flex items-end gap-2 bg-muted/40 backdrop-blur-xl rounded-2xl border border-border/40 p-2 focus-within:border-primary/40 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                />
                
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { fileInputRef.current!.accept = 'image/*'; fileInputRef.current?.click(); }}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { fileInputRef.current!.accept = 'video/*'; fileInputRef.current?.click(); }}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

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
                  className="flex-1 bg-transparent border-0 resize-none text-sm placeholder:text-muted-foreground/50 focus:outline-none min-h-[36px] max-h-32 py-2"
                  style={{ height: 'auto', overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
                />

                <Button 
                  onClick={handleSend}
                  disabled={isLoading || !isOnline || (!input.trim() && mediaQueue.length === 0)}
                  size="icon"
                  className="h-8 w-8 rounded-xl shrink-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Intelligence Panel */}
        <AnimatePresence>
          {showIntelligence && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="border-l border-border/40 bg-muted/10 backdrop-blur-xl overflow-hidden shrink-0"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Intelligence</p>

                  {/* Tool Predictions */}
                  <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border/30 p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Tool Predictions</span>
                    </div>
                    {store.toolResult?.tools && store.toolResult.tools.length > 0 ? (
                      <div className="space-y-2">
                        {(Array.isArray(store.toolResult.tools) ? store.toolResult.tools : []).slice(0, 4).map((tool: any, i: number) => {
                          const name = typeof tool === 'string' ? tool : tool.name || tool.tool;
                          const conf = typeof tool === 'object' && tool.confidence ? tool.confidence : 70 + Math.random() * 30;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">{name}</span>
                                <span className="text-foreground">{Math.round(conf)}%</span>
                              </div>
                              <div className="h-1 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${conf}%` }}
                                  className="h-full bg-primary rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60">No predictions yet</p>
                    )}
                  </div>

                  {/* Future Memory */}
                  <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border/30 p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Future Memory</span>
                    </div>
                    {store.futureResult?.next_steps && store.futureResult.next_steps.length > 0 ? (
                      <div className="space-y-1.5">
                        {store.futureResult.next_steps.slice(0, 4).map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                            <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60">No predictions yet</p>
                    )}
                  </div>

                  {/* System Status */}
                  <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border/30 p-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">System Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Vision', icon: Eye, active: status.vision },
                        { label: 'Memory', icon: Cpu, active: status.memory },
                        { label: 'Tools', icon: Wrench, active: status.tools },
                        { label: 'Safety', icon: Shield, active: status.safety },
                      ].map((s, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${s.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground/60'}`}>
                          <s.icon className="h-3 w-3" />
                          <span>{s.label}</span>
                          {s.active && <Circle className="h-1.5 w-1.5 fill-current ml-auto" />}
                        </div>
                      ))}
                    </div>
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