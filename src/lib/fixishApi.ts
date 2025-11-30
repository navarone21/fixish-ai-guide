import { useFixish } from "@/contexts/FixishProvider";

/* -------------------------------------------------
   FIX-ISH BACKEND SYNC ENGINE
   Centralized API wrapper for all modules
-------------------------------------------------- */

const BASE = "https://fix-ish-1.onrender.com";

/* Low-level helper */
async function post(endpoint: string, body: any) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ----------------------- */
/*  SUPER AGENT (chat)     */
/* ----------------------- */
export async function askSuperAgent(prompt: string, media: any[] = []) {
  return await post("/ask", {
    prompt,
    media,
    mode: "auto",
  });
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
