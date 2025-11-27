import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishHazards() {
  const [hazards, setHazards] = useState<string[]>([]);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("world", (data) => {
      if (data?.hazards) {
        setHazards(data.hazards);
      }
    });
    
    return () => unsub();
  }, []);

  return hazards;
}
