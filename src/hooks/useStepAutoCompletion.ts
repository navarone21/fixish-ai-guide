import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useStepAutoCompletion() {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.step_completed !== undefined) {
        setCompleted(data.step_completed);
      }
    });

    return () => unsub();
  }, []);

  return completed;
}
