import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishWorld() {
  const [world, setWorld] = useState<any>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("world", (data) => {
      setWorld(data);
    });
    
    return () => unsub();
  }, []);

  return world;
}
