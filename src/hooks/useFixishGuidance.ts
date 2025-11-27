import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishGuidance() {
  const [guidance, setGuidance] = useState<string | null>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("world", (data) => {
      if (data?.guidance) {
        setGuidance(data.guidance);
      }
    });
    
    return () => unsub();
  }, []);

  return guidance;
}
