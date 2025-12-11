const API_BASE = import.meta.env.VITE_FIXISH_API ?? "http://localhost:5050";

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson
      ? (payload as any)?.error || (payload as any)?.message || "Request failed"
      : (payload as string) || response.statusText;
    throw new Error(message);
  }

  return payload as T;
}

function buildUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function postJson<T>(path: string, body: unknown) {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  return handleResponse<T>(response);
}

async function postForm<T>(path: string, file: File, extraFields?: Record<string, string>) {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(extraFields ?? {}).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(buildUrl(path), {
    method: "POST",
    body: formData,
  });

  return handleResponse<T>(response);
}

async function getRequest<T>(path: string) {
  const response = await fetch(buildUrl(path));
  return handleResponse<T>(response);
}

export interface FixishInstructionPayload {
  instruction?: string;
  steps?: string[];
  timeline?: {
    past?: string[];
    future?: string[];
  };
  warnings?: string[];
  emotion?: {
    label?: string;
    guidance?: string;
    confidence?: number;
  };
  tools?: Array<{ name: string; description?: string; confidence?: number }>;
  overlays?: string[];
  agents?: Array<{ name: string; message: string }>;
}

export interface TaskHistoryItem {
  id: string;
  name: string;
  updatedAt: string;
  status: string;
}

export const processImage = (file: File, metadata?: Record<string, string>) =>
  postForm<FixishInstructionPayload>("/process/image", file, metadata);

export const processVideo = (file: File, metadata?: Record<string, string>) =>
  postForm<FixishInstructionPayload>("/process/video", file, metadata);

export const processAudio = (file: File, metadata?: Record<string, string>) =>
  postForm<FixishInstructionPayload>("/process/audio", file, metadata);

export const processText = (prompt: string, context?: Record<string, unknown>) =>
  postJson<FixishInstructionPayload>("/process/text", {
    prompt,
    ...context,
  });

export const startTask = (name: string) =>
  postJson<{ taskId: string; name: string }>("/tasks/start", { name });

export const continueTask = (payload?: Record<string, unknown>) =>
  postJson<FixishInstructionPayload>("/tasks/continue", payload ?? {});

export const fetchHistory = () =>
  getRequest<{ tasks?: TaskHistoryItem[]; data?: TaskHistoryItem[] }>("/tasks/history");

export const getOverlays = () =>
  getRequest<{ overlays?: string[] }>("/overlays");

export const fixishApi = {
  processImage,
  processVideo,
  processAudio,
  processText,
  startTask,
  continueTask,
  fetchHistory,
  getOverlays,
};

export type FixishApi = typeof fixishApi;

// ---------------------------------------------------------------------------
// Legacy helpers still used across the app (Super Agent, diagnostics, etc.)
// ---------------------------------------------------------------------------

export const askSuperAgent = (
  prompt: string,
  media: any[] = [],
  skillLevel = "intermediate"
) =>
  postJson("/ask", {
    prompt,
    media,
    mode: "auto",
    skill_level: skillLevel,
  });

export const analyzeImage = (file: File) =>
  postForm<{ analysis: string }>("/analyze-image", file);

export const suggestEdits = (file: File, prompt: string) =>
  postForm<{ edited_image: string; suggestions?: string[] }>("/edit", file, {
    prompt,
  });

export const analyzeVideoFrame = (file: File) =>
  postForm<{ frame_analysis: string }>("/analyze-video-frame", file);

export const analyzeFrame = (base64Frame: string) =>
  postJson("/live", {
    frame: base64Frame,
    mode: "live",
  });

export const fetchMesh = (image: string) =>
  postJson("/mesh", {
    input: image,
  });

export const fetchSceneGraph = (image: string) =>
  postJson("/scene", {
    input: image,
  });

export const fetchDiagnostics = (image: string) =>
  postJson("/diagnostics", {
    input: image,
  });

export const saveProjectToBackend = (project: any) =>
  postJson("/history/save", {
    project,
  });

export const loadProjectFromBackend = (id: string) =>
  postJson("/history/load", {
    id,
  });

export const FixishAPI = {
  askSuperAgent,
  analyzeImage,
  suggestEdits,
  analyzeVideoFrame,
  analyzeFrame,
  fetchMesh,
  fetchSceneGraph,
  fetchDiagnostics,
  saveProjectToBackend,
  loadProjectFromBackend,
};
