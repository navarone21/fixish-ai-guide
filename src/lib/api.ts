const API_BASE = "https://gnu-considerations-comic-cheap.trycloudflare.com/api";

// Detection endpoint - detects tools/parts in image
export async function detectImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/detect`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Detection API failed");
  return await res.json();
}

// Analyze parts endpoint
export async function analyzeParts(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze-parts`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Analyze parts API failed");
  return await res.json();
}

// Get repair steps endpoint
export async function getRepairSteps(issue: string) {
  const res = await fetch(`${API_BASE}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  if (!res.ok) throw new Error("Repair steps API failed");
  return await res.json();
}

// Video steps endpoint
export async function getVideoSteps(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/video-steps`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Video steps API failed");
  return await res.json();
}

// Tools extraction endpoint
export async function extractTools(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/tools`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Tools extraction API failed");
  return await res.json();
}

// Safety warnings endpoint
export async function getSafetyWarnings(issue: string) {
  const res = await fetch(`${API_BASE}/safety`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  if (!res.ok) throw new Error("Safety warnings API failed");
  return await res.json();
}

// Full Fix-ISH workflow endpoint
export async function runFixishFlow(file: File, issue?: string) {
  const form = new FormData();
  form.append("file", file);
  if (issue) form.append("issue", issue);
  const res = await fetch(`${API_BASE}/fixish-flow`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Fix-ISH flow API failed");
  return await res.json();
}

// Quick diagnostic endpoint
export async function quickDiagnose(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/quick-diagnose`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Quick diagnose API failed");
  return await res.json();
}

// Legacy chat endpoint
export async function sendChat(message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Chat API failed");
  return (await res.json()).reply;
}

// Legacy image analysis
export async function analyzeImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze-image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Image analysis API failed");
  return (await res.json()).analysis;
}

// Legacy video analysis
export async function analyzeVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze-video`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Video analysis API failed");
  return (await res.json()).analysis;
}
