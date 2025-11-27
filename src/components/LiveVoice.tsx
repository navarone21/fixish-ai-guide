import { useState, useRef, useEffect } from "react";
import { VoiceSocket } from "@/lib/VoiceSocket";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveVoiceProps {
  onTranscript: (text: string) => void;
  onAIResponse: (narration: string) => void;
}

export function LiveVoice({ onTranscript, onAIResponse }: LiveVoiceProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const socketRef = useRef<VoiceSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const backendWS = "wss://operations-english-relates-invited.trycloudflare.com/api/ws/audio";

  useEffect(() => {
    return () => {
      socketRef.current?.close();
      recorderRef.current?.stop();
    };
  }, []);

  const startVoice = async () => {
    try {
      setProcessing(true);

      // Initialize WebSocket
      socketRef.current = new VoiceSocket(backendWS);
      socketRef.current.connect((data) => {
        if (data.recognized_text) {
          onTranscript(data.recognized_text);
        }
        if (data.narration) {
          onAIResponse(data.narration);
        }
        setProcessing(false);
      });

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = recorder;

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(",")[1];
          socketRef.current?.sendAudio(base64Audio);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setRecording(true);
      setProcessing(false);

      toast({
        title: "Recording started",
        description: "Speak now to interact with Fix-ISH AI",
      });
    } catch (error) {
      console.error("Error starting voice:", error);
      setProcessing(false);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVoice = () => {
    recorderRef.current?.stop();
    setRecording(false);
    setProcessing(true);
    
    toast({
      title: "Processing...",
      description: "Analyzing your voice input",
    });
  };

  return (
    <Button
      onClick={recording ? stopVoice : startVoice}
      disabled={processing}
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
      size="lg"
    >
      {recording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      {processing ? "Processing..." : recording ? "Stop Recording" : "Start Voice"}
    </Button>
  );
}
