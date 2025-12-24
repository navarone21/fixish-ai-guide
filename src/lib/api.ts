// src/lib/api.ts

// Get API base URL from environment variables
const API_BASE = import.meta.env.VITE_API_BASE || 
                 import.meta.env.VITE_FIXISH_BACKEND_URL || 
                 "http://localhost:5050";

export const API_BASE_URL = `${API_BASE}/api`;

console.log("🔧 API Base URL:", API_BASE_URL);

// -----------------------------
// Generic Fetch Wrapper
// -----------------------------

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} – ${res.statusText}`);
    }

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Unknown error from FIX-ISH backend");
    }

    return json.data as T;
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

// -----------------------------
// Types
// -----------------------------

export interface DetectResponse {
  detections?: any[];
  objects: any[];
  image_width: number;
  image_height: number;
}

export interface ChatResponse {
  reply: string;
}

export interface AnalyzeImageResponse {
  analysis: string;
}

export interface AnalyzeVideoResponse {
  analysis: string;
}

export interface PartsResponse {
  parts: any[];
}

export interface StepsResponse {
  steps: string[];
}

export interface VideoStepsResponse {
  steps: string[];
}

export interface ToolsResponse {
  tools: any[];
}

export interface SafetyResponse {
  warnings: any[];
}

export interface FixishFlowResponse {
  flow: any;
  overlays?: any[];
}

export interface QuickDiagnoseResponse {
  diagnosis: string;
}

// -----------------------------
// JSON Endpoints
// -----------------------------

export const detect = (body: any) =>
  apiRequest<DetectResponse>("/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const analyzeParts = (body: any) =>
  apiRequest<PartsResponse>("/analyze-parts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const steps = (body: any) =>
  apiRequest<StepsResponse>("/steps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const tools = (body: any) =>
  apiRequest<ToolsResponse>("/tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const safety = (body: any) =>
  apiRequest<SafetyResponse>("/safety", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const quickDiagnose = (body: any) =>
  apiRequest<QuickDiagnoseResponse>("/quick-diagnose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const fixishFlow = (body: any) =>
  apiRequest<FixishFlowResponse>("/fixish-flow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// -----------------------------
// Multipart (Image / Video)
// -----------------------------

function uploadFile<T>(endpoint: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  return apiRequest<T>(endpoint, {
    method: "POST",
    body: form,
  });
}

export const detectImage = (file: File) =>
  uploadFile<DetectResponse>("/detect", file);

export const stepsFromImage = (file: File) =>
  uploadFile<StepsResponse>("/steps", file);

export const videoSteps = (file: File) =>
  uploadFile<VideoStepsResponse>("/video-steps", file);

export const analyzePartsFromImage = (file: File) =>
  uploadFile<PartsResponse>("/analyze-parts", file);

export const toolsFromImage = (file: File) =>
  uploadFile<ToolsResponse>("/tools", file);

export const safetyFromImage = (file: File) =>
  uploadFile<SafetyResponse>("/safety", file);

// -----------------------------
// Chat & Analysis Endpoints
// -----------------------------

export const sendChat = (message: string) =>
  apiRequest<ChatResponse>("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

export const analyzeImage = (file: File) =>
  uploadFile<AnalyzeImageResponse>("/analyze-image", file);

export const analyzeVideo = (file: File) =>
  uploadFile<AnalyzeVideoResponse>("/analyze-video", file);

export const runFixishFlow = (file: File, issue?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (issue) form.append("issue", issue);
  
  return apiRequest<FixishFlowResponse>("/fixish-flow", {
    method: "POST",
    body: form,
  });
};

export const getVideoSteps = (file: File) =>
  uploadFile<VideoStepsResponse>("/video-steps", file);

// -----------------------------
// Export everything together
// -----------------------------

export const FixishAPI = {
  detect,
  detectImage,
  analyzeParts,
  analyzePartsFromImage,
  steps,
  stepsFromImage,
  videoSteps,
  getVideoSteps,
  tools,
  toolsFromImage,
  safety,
  safetyFromImage,
  quickDiagnose,
  fixishFlow,
  runFixishFlow,
  sendChat,
  analyzeImage,
  analyzeVideo,
};
