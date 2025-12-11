import { create } from "zustand";
import {
  processImage,
  processVideo,
  processAudio,
  processText,
  startTask as startTaskApi,
  continueTask as continueTaskApi,
  fetchHistory as fetchHistoryApi,
  getOverlays as getOverlaysApi,
  type FixishInstructionPayload,
  type TaskHistoryItem,
} from "@/lib/fixishApi";

export type SystemStatusValue = "idle" | "processing" | "ready" | "error";

export interface ConsoleResponseEntry {
  id: string;
  agent: string;
  message: string;
  timestamp: string;
}

export interface ConsoleTool {
  name: string;
  description?: string;
  confidence?: number;
}

export interface ConsoleModeState {
  childSafe: boolean;
  elderMode: boolean;
  doItWithYou: boolean;
  offline: boolean;
}

interface TaskTimeline {
  past: string[];
  future: string[];
}

interface ConsoleEmotionState {
  label: string;
  guidance: string;
  confidence?: number;
}

export interface FixishConsoleState {
  systemStatus: {
    vision: SystemStatusValue;
    emotion: SystemStatusValue;
    tools: SystemStatusValue;
    backend: SystemStatusValue;
  };
  currentTaskId?: string;
  currentTaskName?: string;
  responseFeed: ConsoleResponseEntry[];
  tools: ConsoleTool[];
  emotion: ConsoleEmotionState;
  instructions: string[];
  timeline: TaskTimeline;
  warnings: string[];
  overlays: string[];
  lastError?: string;
  history: TaskHistoryItem[];
  historyLoading: boolean;
  modes: ConsoleModeState;
  voiceTone: "calm" | "technical" | "motivational";
  actions: {
    ingestImage: (file: File) => Promise<void>;
    ingestVideo: (file: File) => Promise<void>;
    ingestAudio: (file: File) => Promise<void>;
    submitPrompt: (prompt: string) => Promise<void>;
    startTask: (name: string) => Promise<void>;
    continueTask: () => Promise<void>;
    loadHistory: () => Promise<void>;
    resumeTask: (task: TaskHistoryItem) => Promise<void>;
    refreshOverlays: () => Promise<void>;
    updateModes: (patch: Partial<ConsoleModeState>) => void;
    setVoiceTone: (tone: "calm" | "technical" | "motivational") => void;
    clearError: () => void;
  };
}

const createEntry = (agent: string, message: string): ConsoleResponseEntry => ({
  id: crypto.randomUUID?.() ?? `${agent}-${Date.now()}`,
  agent,
  message,
  timestamp: new Date().toISOString(),
});

const deriveTimeline = (payload?: FixishInstructionPayload): TaskTimeline => ({
  past: payload?.timeline?.past ?? [],
  future: payload?.timeline?.future ?? [],
});

const deriveInstructions = (payload?: FixishInstructionPayload) =>
  payload?.steps ?? (payload?.instruction ? [payload.instruction] : []);

const deriveTools = (payload?: FixishInstructionPayload): ConsoleTool[] =>
  payload?.tools?.map((tool) => ({
    name: tool.name,
    description: tool.description,
    confidence: tool.confidence,
  })) ?? [];

const deriveWarnings = (payload?: FixishInstructionPayload) => payload?.warnings ?? [];

const deriveEmotion = (payload?: FixishInstructionPayload): ConsoleEmotionState => ({
  label: payload?.emotion?.label ?? "Steady",
  guidance: payload?.emotion?.guidance ?? "Awaiting audio signal",
  confidence: payload?.emotion?.confidence,
});

const initialState: Omit<FixishConsoleState, "actions"> = {
  systemStatus: {
    vision: "idle",
    emotion: "idle",
    tools: "idle",
    backend: "ready",
  },
  responseFeed: [],
  tools: [],
  emotion: { label: "Steady", guidance: "Awaiting audio signal" },
  instructions: [],
  timeline: { past: [], future: [] },
  warnings: [],
  overlays: [],
  history: [],
  historyLoading: false,
  modes: {
    childSafe: false,
    elderMode: false,
    doItWithYou: false,
    offline: false,
  },
  voiceTone: "calm",
};

export const useFixishConsoleStore = create<FixishConsoleState>((set, get) => ({
  ...initialState,
  actions: {
    async ingestImage(file) {
      set((state) => ({
        systemStatus: { ...state.systemStatus, vision: "processing" },
        lastError: undefined,
      }));
      try {
        const payload = await processImage(file);
        set((state) => ({
          systemStatus: { ...state.systemStatus, vision: "ready" },
          instructions: deriveInstructions(payload) || state.instructions,
          timeline: deriveTimeline(payload),
          warnings: deriveWarnings(payload),
          tools: deriveTools(payload),
          responseFeed: [
            createEntry("Vision Engine", payload?.instruction ?? "Frame analyzed."),
            ...state.responseFeed,
          ].slice(0, 20),
        }));
      } catch (error: any) {
        set((state) => ({
          systemStatus: { ...state.systemStatus, vision: "error" },
          lastError: error?.message ?? "Unable to process image",
        }));
      }
    },
    async ingestVideo(file) {
      set((state) => ({
        systemStatus: { ...state.systemStatus, vision: "processing" },
        lastError: undefined,
      }));
      try {
        const payload = await processVideo(file);
        set((state) => ({
          systemStatus: { ...state.systemStatus, vision: "ready" },
          timeline: deriveTimeline(payload),
          responseFeed: [
            createEntry("Vision Engine", payload?.instruction ?? "Video ingested."),
            ...state.responseFeed,
          ].slice(0, 20),
        }));
      } catch (error: any) {
        set((state) => ({
          systemStatus: { ...state.systemStatus, vision: "error" },
          lastError: error?.message ?? "Unable to process video",
        }));
      }
    },
    async ingestAudio(file) {
      set((state) => ({
        systemStatus: { ...state.systemStatus, emotion: "processing" },
        lastError: undefined,
      }));
      try {
        const payload = await processAudio(file);
        set((state) => ({
          systemStatus: { ...state.systemStatus, emotion: "ready" },
          emotion: deriveEmotion(payload),
          responseFeed: [
            createEntry(
              "Emotion Engine",
              payload?.emotion?.guidance ?? "Audio signal decoded."
            ),
            ...state.responseFeed,
          ].slice(0, 20),
        }));
      } catch (error: any) {
        set((state) => ({
          systemStatus: { ...state.systemStatus, emotion: "error" },
          lastError: error?.message ?? "Unable to process audio",
        }));
      }
    },
    async submitPrompt(prompt) {
      if (!prompt?.trim()) return;
      set((state) => ({
        systemStatus: { ...state.systemStatus, backend: "processing" },
        lastError: undefined,
      }));
      try {
        const payload = await processText(prompt, {
          taskId: get().currentTaskId,
          modes: get().modes,
          voiceTone: get().voiceTone,
        });
        set((state) => ({
          systemStatus: { ...state.systemStatus, backend: "ready" },
          instructions: deriveInstructions(payload) || state.instructions,
          timeline: deriveTimeline(payload),
          warnings: deriveWarnings(payload),
          tools: deriveTools(payload),
          emotion: payload?.emotion ? deriveEmotion(payload) : state.emotion,
          responseFeed: [
            createEntry("Orchestrator", payload?.instruction ?? "Response streamed."),
            ...(payload?.agents?.map((agent) =>
              createEntry(agent.name, agent.message)
            ) ?? []),
            ...state.responseFeed,
          ].slice(0, 20),
        }));
      } catch (error: any) {
        set((state) => ({
          systemStatus: { ...state.systemStatus, backend: "error" },
          lastError: error?.message ?? "Unable to process prompt",
        }));
      }
    },
    async startTask(name) {
      if (!name.trim()) return;
      try {
        const result = await startTaskApi(name);
        set((state) => ({
          currentTaskId: result.taskId,
          currentTaskName: result.name,
          responseFeed: [
            createEntry("Mission Control", `Task '${result.name}' initiated.`),
            ...state.responseFeed,
          ].slice(0, 20),
        }));
      } catch (error: any) {
        set({ lastError: error?.message ?? "Unable to start task" });
      }
    },
    async continueTask() {
      try {
        const payload = await continueTaskApi({ taskId: get().currentTaskId });
        set((state) => ({
          instructions: deriveInstructions(payload) || state.instructions,
          timeline: deriveTimeline(payload),
          responseFeed: [
            createEntry("Mission Control", payload?.instruction ?? "Continuing task."),
            ...state.responseFeed,
          ].slice(0, 20),
        }));
      } catch (error: any) {
        set({ lastError: error?.message ?? "Unable to continue task" });
      }
    },
    async loadHistory() {
      set({ historyLoading: true, lastError: undefined });
      try {
        const payload = await fetchHistoryApi();
        const history = payload.tasks ?? payload.data ?? [];
        set({ history, historyLoading: false });
      } catch (error: any) {
        set({
          historyLoading: false,
          lastError: error?.message ?? "Unable to fetch history",
        });
      }
    },
    async resumeTask(task) {
      set({ currentTaskId: task.id, currentTaskName: task.name });
      await get().actions.continueTask();
    },
    async refreshOverlays() {
      try {
        const payload = await getOverlaysApi();
        set({ overlays: payload.overlays ?? [] });
      } catch (error: any) {
        set({ lastError: error?.message ?? "Unable to fetch overlays" });
      }
    },
    updateModes(patch) {
      set((state) => ({
        modes: { ...state.modes, ...patch },
      }));
    },
    setVoiceTone(tone) {
      set({ voiceTone: tone });
    },
    clearError() {
      set({ lastError: undefined });
    },
  },
}));

export type FixishConsoleActions = FixishConsoleState["actions"];
