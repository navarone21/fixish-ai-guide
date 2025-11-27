import { useState, useEffect, useRef } from "react";
import { LiveVoice } from "@/components/LiveVoice";
import { ARCanvas } from "@/components/ARCanvas";
import { useFixish } from "@/contexts/FixishProvider";
import { AnchorManager } from "@/lib/AnchorManager";
import { DeviceMotionListener } from "@/lib/DeviceMotion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import "../styles/fixish.css";

const anchorMgr = new AnchorManager();

const LiveRepair = () => {
  const { overlay, instructions, objects, connect } = useFixish();
  const [transcript, setTranscript] = useState<string[]>([]);
  const [aiResponses, setAIResponses] = useState<string[]>([]);
  const [frameData, setFrameData] = useState<{ frame: string; anchors: any } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to Fixish WebSocket on mount
  useEffect(() => {
    connect();
  }, [connect]);

  const handleTranscript = (text: string) => {
    console.log("User said:", text);
    setTranscript((prev) => [...prev, text]);
  };

  const handleAIResponse = (narration: string) => {
    console.log("AI narration:", narration);
    setAIResponses((prev) => [...prev, narration]);
  };

  useEffect(() => {
    const imu = new DeviceMotionListener((orientation) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "imu",
            orientation,
          })
        );
      }
    });

    imu.start();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Live Voice Repair Assistant
          </h1>
          <p className="text-muted-foreground mb-8">
            Speak with Fix-ISH AI in real-time for instant repair guidance
          </p>

          <div className="flex justify-center mb-8">
            <LiveVoice 
              onTranscript={handleTranscript}
              onAIResponse={handleAIResponse}
            />
          </div>

          {/* AR Canvas */}
          {overlay && (
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <img src={overlay} alt="AR Overlay" className="rounded-xl shadow-lg max-w-full" />
                <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                  Live AR
                </div>
              </div>
            </div>
          )}

          {/* AI Instructions */}
          {instructions && (
            <div className="mb-8 bg-primary/10 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Current Instructions
              </h2>
              <p className="text-foreground">{instructions}</p>
            </div>
          )}

          {/* Detected Objects */}
          {objects.length > 0 && (
            <div className="mb-8 bg-accent/50 rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Detected Objects
              </h2>
              <div className="flex flex-wrap gap-2">
                {objects.map((obj, idx) => (
                  <div key={idx} className="bg-background rounded-lg px-3 py-1 border border-border text-sm">
                    {obj.label || obj.class || 'Unknown'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Transcripts */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Your Speech
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transcript.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Your transcribed speech will appear here...
                  </p>
                ) : (
                  transcript.map((text, idx) => (
                    <div 
                      key={idx}
                      className="bg-accent/50 rounded-lg p-3 text-accent-foreground"
                    >
                      {text}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Responses */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                AI Responses
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {aiResponses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    AI responses will appear here...
                  </p>
                ) : (
                  aiResponses.map((response, idx) => (
                    <div 
                      key={idx}
                      className="bg-primary/10 rounded-lg p-3 text-foreground border border-primary/20"
                    >
                      {response}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LiveRepair;
