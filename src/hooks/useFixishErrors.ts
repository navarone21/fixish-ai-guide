import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useFixishErrors() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const client = FixishClient.getInstance();
    if (!client) return;
    
    const unsub = client.subscribe("data", (data) => {
      if (data?.errors) {
        setErrors(data.errors);
      }
    });

    return () => unsub();
  }, []);

  return errors;
}
