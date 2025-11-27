import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useVideoClip() {
  const [clip, setClip] = useState<any>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.video_clip) {
        setClip(data.video_clip);
      }
    });

    return () => unsub();
  }, []);

  return clip;
}
