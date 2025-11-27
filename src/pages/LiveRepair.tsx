import { useState, useEffect, useRef } from "react";
import { LiveVoice } from "@/components/LiveVoice";
import { useFixish } from "@/contexts/FixishProvider";
import { useFixishCamera } from "@/hooks/useFixishCamera";
import { AnchorManager } from "@/lib/AnchorManager";
import { DeviceMotionListener } from "@/lib/DeviceMotion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import SafetyAlert from "@/components/SafetyAlert";
import InstructionsPanel from "@/components/InstructionsPanel";
import StepsPanel from "@/components/StepsPanel";
import MeshStatus from "@/components/MeshStatus";
import "../styles/fixish.css";

const anchorMgr = new AnchorManager();

const LiveRepair = () => {
  const { overlay, instructions, objects } = useFixish();
  const { videoRef, canvasRef, startCamera, stopCamera, isStreaming } = useFixishCamera();
  const [transcript, setTranscript] = useState<string[]>([]);
  const [aiResponses, setAIResponses] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

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
        <div className="fixish-container">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Live AR Repair Assistant
          </h1>
          <p className="text-muted-foreground mb-8">
            Point your camera at the damaged item for real-time repair guidance
          </p>

          {/* Camera + Overlay */}
          <div className="camera-wrapper mb-8">
            <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
            <canvas ref={canvasRef} className="hidden" />

            {overlay && (
              <img
                src={`data:image/jpeg;base64,${overlay}`}
                alt="AR Overlay"
                className="ai-overlay"
              />
            )}
          </div>

          {/* Camera Controls */}
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className="start-btn mb-8"
          >
            {isStreaming ? "Stop Camera" : "Start Camera"}
          </button>

          {/* Safety Alert */}
          <div className="mb-6">
            <SafetyAlert />
          </div>

          {/* Side Panel with All Status Components */}
          <div className="side-panel space-y-6">
            <InstructionsPanel />
            <StepsPanel />
            <MeshStatus />
            
            {/* Detected Objects */}
            {objects.length > 0 && (
              <div className="bg-accent/50 rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-accent-foreground mb-3">
                  Detected Objects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {objects.map((obj, idx) => (
                    <div key={idx} className="bg-background rounded-lg px-3 py-1 border border-border text-sm">
                      {obj.label || obj.class || 'Unknown'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
