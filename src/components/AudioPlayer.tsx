import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioPlayerProps {
  text: string;
  isDarkMode: boolean;
}

export const AudioPlayer = ({ text, isDarkMode }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const generateAudio = async () => {
    if (isLoading || isPlaying) return;

    setIsLoading(true);
    try {
      // Call text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Convert base64 to blob
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Create audio element
        const audio = new Audio(url);
        audioRef.current = audio;

        // Analyze audio for waveform
        await analyzeAudio(audioBlob);

        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);

        audio.play();
      }
    } catch (error) {
      console.error('Audio generation error:', error);
      toast({
        title: "Audio generation failed",
        description: "Could not generate audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);

      // Generate simplified waveform data (50 bars)
      const bars = 50;
      const blockSize = Math.floor(channelData.length / bars);
      const waveformData: number[] = [];

      for (let i = 0; i < bars; i++) {
        const start = i * blockSize;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[start + j]);
        }
        waveformData.push(sum / blockSize);
      }

      // Normalize
      const max = Math.max(...waveformData);
      const normalized = waveformData.map(v => (v / max) * 100);
      setWaveform(normalized);
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      generateAudio();
    } else if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        disabled={isLoading}
        className="h-7 gap-1.5"
        style={{
          color: isDarkMode ? "#00C2B2" : "#00C2B2",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Headphones className="w-4 h-4" />
        )}
        <span className="text-xs">{isPlaying ? "Playing..." : "Listen"}</span>
      </Button>

      {waveform.length > 0 && (
        <div className="flex items-center gap-[2px] h-7 flex-1 max-w-[200px]">
          {waveform.map((height, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full"
              style={{
                background: isPlaying ? "#00C2B2" : isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.5)",
                minHeight: '4px',
              }}
              initial={{ height: '4px' }}
              animate={{
                height: isPlaying ? `${Math.max(4, height)}%` : '4px',
              }}
              transition={{
                duration: 0.3,
                delay: i * 0.01,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
