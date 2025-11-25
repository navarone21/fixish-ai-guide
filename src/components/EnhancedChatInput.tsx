import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Video, Paperclip, Mic, Square, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
  onAudioUpload: (file: File) => void;
  disabled?: boolean;
}

export function EnhancedChatInput({
  onSendMessage,
  onImageUpload,
  onVideoUpload,
  onAudioUpload,
  disabled,
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ type: string; file: File }[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !disabled && !isProcessing) {
      // Send message first
      if (message.trim()) {
        onSendMessage(message);
      }
      
      // Then upload attached files
      for (const { type, file } of attachedFiles) {
        if (type === 'image') onImageUpload(file);
        else if (type === 'video') onVideoUpload(file);
        else if (type === 'audio') onAudioUpload(file);
      }
      
      setMessage("");
      setAttachedFiles([]);
      textareaRef.current?.focus();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFiles(prev => [...prev, { type, file }]);
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording...",
        description: "Speak clearly. Click stop when done.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        if (data?.text) {
          setMessage(prev => prev + (prev ? ' ' : '') + data.text);
          toast({
            title: "Voice transcribed",
            description: "Your message is ready to send",
          });
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: "Could not transcribe audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit}>
          {/* Attached Files Preview */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 flex flex-wrap gap-2"
              >
                {attachedFiles.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 text-sm"
                  >
                    {item.type === 'image' && <Image className="w-4 h-4" />}
                    {item.type === 'video' && <Video className="w-4 h-4" />}
                    {item.type === 'audio' && <Paperclip className="w-4 h-4" />}
                    <span className="max-w-[150px] truncate">{item.file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            {/* File Upload Buttons */}
            <div className="flex gap-1">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled}
                className="hover:bg-primary/10"
                title="Upload image"
              >
                <Image className="w-5 h-5" />
              </Button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => videoInputRef.current?.click()}
                disabled={disabled}
                className="hover:bg-primary/10"
                title="Upload video"
              >
                <Video className="w-5 h-5" />
              </Button>

              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audio')}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => audioInputRef.current?.click()}
                disabled={disabled}
                className="hover:bg-primary/10"
                title="Upload audio file"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              {/* Voice Recording Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={disabled || isProcessing}
                className={`hover:bg-primary/10 transition-all ${isRecording ? 'bg-red-500/20' : ''}`}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <Square className="w-5 h-5 fill-red-500 text-red-500" />
                  </motion.div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Message Input */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your repair issue or upload media..."
              className="min-h-[56px] max-h-[200px] resize-none border-border/50 focus:border-primary/50 bg-secondary/30"
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              className="shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 min-w-[56px] h-[56px]"
              disabled={(!message.trim() && attachedFiles.length === 0) || disabled || isProcessing}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line • Upload images, videos, or audio files
        </p>
      </div>
    </div>
  );
}
