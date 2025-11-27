import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishHazards() {
  const [hazards, setHazards] = useState<string[]>([]);

  const speak = (text: string) => {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      speechSynthesis.speak(utter);
    } catch {}
  };

  useEffect(() => {
    const client = FixishClient.getInstance();
    if (!client) return;
    
    const unsub = client.subscribe("world", (data) => {
      if (data?.hazards) {
        setHazards(data.hazards);
      }
    });
    
    return () => unsub();
  }, []);

  useEffect(() => {
    if (hazards.length > 0) {
      speak(hazards[hazards.length - 1]);
    }
  }, [hazards]);

  return hazards;
}
