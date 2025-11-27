import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useTroubleshoot() {
  const [trouble, setTrouble] = useState<any>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    if (!client) return;
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.troubleshoot) {
        setTrouble(data.troubleshoot);
      }
    });
    
    return () => unsub();
  }, []);

  return trouble;
}
