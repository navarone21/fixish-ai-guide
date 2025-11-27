import { useState } from "react";
import { LiveVoice } from "@/components/LiveVoice";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LiveRepair = () => {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [aiResponses, setAIResponses] = useState<string[]>([]);

  const handleTranscript = (text: string) => {
    console.log("User said:", text);
    setTranscript((prev) => [...prev, text]);
  };

  const handleAIResponse = (narration: string) => {
    console.log("AI narration:", narration);
    setAIResponses((prev) => [...prev, narration]);
  };

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
