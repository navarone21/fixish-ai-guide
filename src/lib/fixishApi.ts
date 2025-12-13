/* -------------------------------------------------
   FIX-ISH BACKEND API
   Connects to Flask backend at localhost:5050
-------------------------------------------------- */

const BASE = "http://localhost:5050";
const LEGACY_BASE = "https://fix-ish-1.onrender.com";

/* Low-level helpers */
async function post(endpoint: string, body: any) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function postFormData(endpoint: string, formData: FormData) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function get(endpoint: string) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/* ----------------------- */
/*  AGI PROCESS ENGINE     */
/* ----------------------- */
export interface ProcessPayload {
  prompt: string;
  image?: string; // base64
  audio?: string; // base64
  context?: any;
}

export interface ProcessResponse {
  instructions?: string;
  steps?: string[];
  warnings?: string[];
  overlays?: any[];
  timeline?: {
    past?: any[];
    future?: any[];
  };
  emotion?: {
    label: string;
    confidence: number;
  };
  predicted_tools?: string[];
  agent_messages?: string[];
  error?: string;
}

export async function process(payload: ProcessPayload): Promise<ProcessResponse> {
  return await post("/process", payload);
}

/* ----------------------- */
/*  UPLOAD IMAGE           */
/* ----------------------- */
export interface ImageAnalysisResponse {
  analysis?: string;
  detections?: any[];
  objects?: string[];
  damage_assessment?: any;
  error?: string;
}

export async function uploadImage(file: File): Promise<ImageAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await postFormData("/upload_image", formData);
}

/* ----------------------- */
/*  UPLOAD AUDIO           */
/* ----------------------- */
export interface AudioAnalysisResponse {
  transcription?: string;
  emotion?: {
    label: string;
    confidence: number;
  };
  error?: string;
}

export async function uploadAudio(file: File): Promise<AudioAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await postFormData("/upload_audio", formData);
}

/* ----------------------- */
/*  UPLOAD VIDEO FRAME     */
/* ----------------------- */
export interface VideoFrameResponse {
  frame_analysis?: string;
  detections?: any[];
  error?: string;
}

export async function uploadVideoFrame(file: File): Promise<VideoFrameResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await postFormData("/upload_video_frame", formData);
}

/* ----------------------- */
/*  PREDICT TOOLS          */
/* ----------------------- */
export interface ToolPredictionResponse {
  tools?: string[];
  recommendations?: any[];
  error?: string;
}

export async function predictTools(context?: any): Promise<ToolPredictionResponse> {
  return await post("/predict_tools", context || {});
}

/* ----------------------- */
/*  FUTURE MEMORY          */
/* ----------------------- */
export interface FutureResponse {
  predictions?: any[];
  continuity?: string;
  next_steps?: string[];
  error?: string;
}

export async function getFuture(context?: any): Promise<FutureResponse> {
  return await post("/future", context || {});
}

/* ----------------------- */
/*  HEALTH CHECK           */
/* ----------------------- */
export interface HealthResponse {
  status: string;
  version?: string;
}

export async function getHealth(): Promise<HealthResponse> {
  return await get("/health");
}

/* ----------------------- */
/*  LEGACY ENDPOINTS       */
/*  For SuperAgent compat  */
/* ----------------------- */
async function legacyPost(endpoint: string, body: any) {
  const res = await fetch(`${LEGACY_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function legacyPostFormData(endpoint: string, formData: FormData) {
  const res = await fetch(`${LEGACY_BASE}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function askSuperAgent(prompt: string, media: any[] = [], skillLevel: string = "intermediate") {
  return await legacyPost("/ask", {
    prompt,
    media,
    mode: "auto",
    skill_level: skillLevel,
  });
}

export async function analyzeImage(file: File): Promise<{ analysis: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return await legacyPostFormData("/analyze-image", formData);
}

export async function suggestEdits(file: File, prompt: string): Promise<{ edited_image: string; suggestions?: string[] }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt);
  return await legacyPostFormData("/edit", formData);
}

export async function analyzeVideoFrame(file: File): Promise<{ frame_analysis: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return await legacyPostFormData("/analyze-video-frame", formData);
}

/* ----------------------- */
/*  EXPORT ALL             */
/* ----------------------- */
export const FixishAPI = {
  // New endpoints (localhost:5050)
  process,
  uploadImage,
  uploadAudio,
  uploadVideoFrame,
  predictTools,
  getFuture,
  getHealth,
  // Legacy endpoints (render.com)
  askSuperAgent,
  analyzeImage,
  suggestEdits,
  analyzeVideoFrame,
};
