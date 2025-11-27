import React, { createContext, useContext, useEffect, useState } from "react";
import { FixishClient } from "@/lib/FixishClient";

interface FixishContextValue {
  sessionId: string;
  connect: () => void;
  sendFrame: (base64Frame: string, base64Depth?: string) => void;

  // Live AI data
  objects: any[];
  sceneGraph: any;
  mesh: string | null;
  meshPoints: number;
  overlay: string | null;
  instructions: string | null;
  safety: any;
  taskState: any;
  worldState: any;
}

const FixishContext = createContext<FixishContextValue | null>(null);

export const useFixish = () => {
  const ctx = useContext(FixishContext);
  if (!ctx) throw new Error("useFixish must be used inside FixishProvider");
  return ctx;
};

export const FixishProvider = ({
  backendUrl,
  children,
}: {
  backendUrl: string;
  children: React.ReactNode;
}) => {
  const [sessionId] = useState(() => "fixish-" + Math.random().toString(36).substring(2, 12));
  const [client, setClient] = useState<FixishClient | null>(null);

  // AI Data
  const [objects, setObjects] = useState<any[]>([]);
  const [sceneGraph, setSceneGraph] = useState<any | null>(null);
  const [mesh, setMesh] = useState<string | null>(null);
  const [meshPoints, setMeshPoints] = useState<number>(0);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [safety, setSafety] = useState<any | null>(null);
  const [taskState, setTaskState] = useState<any | null>(null);
  const [worldState, setWorldState] = useState<any | null>(null);

  // Initialize client
  useEffect(() => {
    const fixish = new FixishClient({
      backendUrl,
      sessionId,
      onData: (data) => {
        // Save entire world-state
        setWorldState(data);

        // Individual fields
        if (data.objects) setObjects(data.objects);
        if (data.scene_graph) setSceneGraph(data.scene_graph);
        if (data.mesh) setMesh(data.mesh);
        if (data.mesh_points) setMeshPoints(data.mesh_points);
        if (data.overlay) setOverlay(data.overlay);
        if (data.instructions) setInstructions(data.instructions);
        if (data.safety) setSafety(data.safety);
        if (data.task_state) setTaskState(data.task_state);
      },
    });

    setClient(fixish);
    FixishClient.setInstance(fixish);

    // Start the task session
    fixish.startSession();

    return () => {
      fixish.disconnect();
    };
  }, [backendUrl, sessionId]);

  const connect = () => {
    client?.connectWebSocket();
  };

  const sendFrame = (f: string, d?: string) => {
    client?.sendFrame(f, d);
  };

  return (
    <FixishContext.Provider
      value={{
        sessionId,
        connect,
        sendFrame,
        objects,
        sceneGraph,
        mesh,
        meshPoints,
        overlay,
        instructions,
        safety,
        taskState,
        worldState,
      }}
    >
      {children}
    </FixishContext.Provider>
  );
};
