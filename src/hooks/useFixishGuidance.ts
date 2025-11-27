import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishGuidance() {
  const [guidance, setGuidance] = useState<string | null>(null);

  const speak = (text: string) => {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1.1;
      utter.volume = 0.9;
      speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("Speech failure:", err);
    }
  };

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("world", (data) => {
      if (data?.guidance) {
        setGuidance(data.guidance);
        speak(data.guidance);
      }
    });
    
    return () => unsub();
  }, []);

  return guidance;
}
