import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";
import { FixishState } from "@/types/FixishState";

export function useFixishState() {
  const [state, setState] = useState<FixishState>("idle");

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("state", (data) => {
      if (data?.state) {
        setState(data.state as FixishState);
      }
    });
    
    return () => unsub();
  }, []);

  return state;
}
