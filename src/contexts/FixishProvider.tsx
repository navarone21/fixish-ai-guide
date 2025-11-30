import React, { createContext, useContext, useEffect, useState, useReducer } from "react";
import { FixishClient } from "@/lib/FixishClient";

// Global State Interface
interface GlobalState {
  theme: "light" | "dark";
  currentProject: any | null;
  history: any[];
  mesh: string | null;
  meshMeta: any | null;
  sceneGraph: any[];
  diagnostics: any | null;
  taskGraph: any[];
  steps: any[];
  liveFrame: string | null;
  liveAnalyzing: boolean;
  agentMessages: any[];
}

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

  // Global State Engine
  state: GlobalState;
  setState: (key: keyof GlobalState, value: any) => void;
  mergeState: (obj: Partial<GlobalState>) => void;
  newProject: (name: string) => void;
  saveToHistory: () => void;
}

// Initial Global State
const initialGlobalState: GlobalState = {
  theme: "light",
  currentProject: null,
  history: [],
  mesh: null,
  meshMeta: null,
  sceneGraph: [],
  diagnostics: null,
  taskGraph: [],
  steps: [],
  liveFrame: null,
  liveAnalyzing: false,
  agentMessages: [],
};

// State Reducer
type StateAction =
  | { type: "SET"; key: keyof GlobalState; value: any }
  | { type: "MERGE"; value: Partial<GlobalState> }
  | { type: "NEW_PROJECT"; name: string }
  | { type: "SAVE_HISTORY" }
  | { type: "LOAD_STATE"; state: GlobalState };

function globalStateReducer(state: GlobalState, action: StateAction): GlobalState {
  switch (action.type) {
    case "SET":
      return {
        ...state,
        [action.key]: action.value,
      };

    case "MERGE":
      return {
        ...state,
        ...action.value,
      };

    case "NEW_PROJECT":
      return {
        ...state,
        currentProject: {
          name: action.name,
          created: new Date().toISOString(),
          steps: [],
          diagnostics: null,
          mesh: null,
          sceneGraph: [],
          historyId: Date.now(),
        },
      };

    case "SAVE_HISTORY":
      return {
        ...state,
        history: state.currentProject ? [...state.history, state.currentProject] : state.history,
      };

    case "LOAD_STATE":
      return action.state;

    default:
      return state;
  }
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

  // Global State Engine
  const [globalState, dispatchGlobalState] = useReducer(globalStateReducer, initialGlobalState, (initial) => {
    // Load from localStorage on init
    const saved = localStorage.getItem("fixish_global_state");
    return saved ? JSON.parse(saved) : initial;
  });

  // AI Data (existing)
  const [objects, setObjects] = useState<any[]>([]);
  const [sceneGraph, setSceneGraph] = useState<any | null>(null);
  const [mesh, setMesh] = useState<string | null>(null);
  const [meshPoints, setMeshPoints] = useState<number>(0);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [safety, setSafety] = useState<any | null>(null);
  const [taskState, setTaskState] = useState<any | null>(null);
  const [worldState, setWorldState] = useState<any | null>(null);

  // Persist global state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("fixish_global_state", JSON.stringify(globalState));
  }, [globalState]);

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

  // Global State Engine Functions
  const setGlobalState = (key: keyof GlobalState, value: any) => {
    dispatchGlobalState({ type: "SET", key, value });
  };

  const mergeGlobalState = (obj: Partial<GlobalState>) => {
    dispatchGlobalState({ type: "MERGE", value: obj });
  };

  const newProject = (name: string) => {
    dispatchGlobalState({ type: "NEW_PROJECT", name });
  };

  const saveToHistory = () => {
    dispatchGlobalState({ type: "SAVE_HISTORY" });
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
        // Global State Engine
        state: globalState,
        setState: setGlobalState,
        mergeState: mergeGlobalState,
        newProject,
        saveToHistory,
      }}
    >
      {children}
    </FixishContext.Provider>
  );
};
