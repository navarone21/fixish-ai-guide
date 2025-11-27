import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useOcclusionMask() {
  const [mask, setMask] = useState<number[][] | null>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.occlusion_mask) {
        setMask(data.occlusion_mask);
      }
    });

    return () => unsub();
  }, []);

  return mask;
}
