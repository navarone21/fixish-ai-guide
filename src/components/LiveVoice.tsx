import { useState, useRef } from "react";
import { VoiceSocket } from "@/lib/VoiceSocket";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface LiveVoiceProps {
  onTranscript: (text: string) => void;
  onAIResponse: (narration: string) => void;
}

export function LiveVoice({ onTranscript, onAIResponse }: LiveVoiceProps) {
  const [recording, setRecording] = useState(false);
  const socketRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const backendWS = "wss://operations-english-relates-invited.trycloudflare.com/api/ws/audio";

  const startVoice = async () => {
    socketRef.current = new VoiceSocket(backendWS);
    socketRef.current.connect((data: any) => {
      onTranscript(data.recognized_text);
      onAIResponse(data.narration);
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;

    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () =>
        socketRef.current.sendAudio((reader.result as any).split(",")[1]);
    };

    recorder.start();
    setRecording(true);
  };

  const stopVoice = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <Button
      onClick={recording ? stopVoice : startVoice}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
    >
      {recording ? <Square /> : <Mic />}
      {recording ? "Stop" : "Speak"}
    </Button>
  );
}
