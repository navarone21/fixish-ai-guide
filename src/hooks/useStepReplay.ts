import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useStepReplay() {
  const [replay, setReplay] = useState<any[]>([]);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.replay) {
        setReplay(data.replay);
      }
    });

    return () => unsub();
  }, []);

  return replay;
}
