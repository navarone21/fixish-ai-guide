import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishTool() {
  const [tool, setTool] = useState<any>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    if (!client) return;
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.tool) {
        setTool(data.tool);
      }
    });

    return () => unsub();
  }, []);

  return tool;
}
