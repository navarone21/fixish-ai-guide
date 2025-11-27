import { useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

export function useMesh() {
  const [mesh, setMesh] = useState<any>(null);

  useEffect(() => {
    const client = FixishClient.getInstance();
    
    const unsub = client.subscribe("world", (data) => {
      if (data?.mesh) {
        setMesh(data.mesh);
      }
    });
    
    return () => unsub();
  }, []);

  return mesh;
}
