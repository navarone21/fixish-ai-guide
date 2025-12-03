/* -------------------------------------------------
   FIX-ISH BACKEND SYNC ENGINE
   Centralized API wrapper for all modules
-------------------------------------------------- */

const BASE = "https://fix-ish-1.onrender.com";

/* Low-level helpers */
async function post(endpoint: string, body: any) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function postFormData(endpoint: string, formData: FormData) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

/* ----------------------- */
/*  SUPER AGENT (chat)     */
/* ----------------------- */
export async function askSuperAgent(prompt: string, media: any[] = [], skillLevel: string = "intermediate") {
  return await post("/ask", {
    prompt,
    media,
    mode: "auto",
    skill_level: skillLevel,
  });
}

/* ----------------------- */
/*  ANALYZE IMAGE          */
/* ----------------------- */
export async function analyzeImage(file: File): Promise<{ analysis: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return await postFormData("/analyze-image", formData);
}

/* ----------------------- */
/*  EDIT (suggestions)     */
/* ----------------------- */
export async function suggestEdits(file: File, prompt: string): Promise<{ edited_image: string; suggestions?: string[] }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt);
  return await postFormData("/edit", formData);
}

/* ----------------------- */
/*  ANALYZE VIDEO FRAME    */
/* ----------------------- */
export async function analyzeVideoFrame(file: File): Promise<{ frame_analysis: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return await postFormData("/analyze-video-frame", formData);
}

/* ----------------------- */
/*  LIVE MODE (frames)     */
/* ----------------------- */
export async function analyzeFrame(base64Frame: string) {
  return await post("/live", {
    frame: base64Frame,
    mode: "live",
  });
}

/* ----------------------- */
/*  MESH RECONSTRUCTION    */
/* ----------------------- */
export async function fetchMesh(image: string) {
  return await post("/mesh", {
    input: image,
  });
}

/* ----------------------- */
/*  SCENE GRAPH            */
/* ----------------------- */
export async function fetchSceneGraph(image: string) {
  return await post("/scene", {
    input: image,
  });
}

/* ----------------------- */
/*  DIAGNOSTICS            */
/* ----------------------- */
export async function fetchDiagnostics(image: string) {
  return await post("/diagnostics", {
    input: image,
  });
}

/* ----------------------- */
/*  PROJECT HISTORY        */
/* ----------------------- */
export async function saveProjectToBackend(project: any) {
  return await post("/history/save", {
    project,
  });
}

export async function loadProjectFromBackend(id: string) {
  return await post("/history/load", {
    id,
  });
}

/* ----------------------- */
/*  EXPORT ALL             */
/* ----------------------- */
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
