export const BASE_URL = "https://operations-english-relates-invited.trycloudflare.com/api";

export async function detectImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/detect`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Detection failed");
  return await res.json();
}

export async function analyzeParts(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/analyze-parts`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Parts analysis failed");
  return await res.json();
}

export async function getRepairSteps(issue: string) {
  const res = await fetch(`${BASE_URL}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  if (!res.ok) throw new Error("Steps failed");
  return await res.json();
}

export async function getRepairStepsFromImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/steps`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Steps from image failed");
  return await res.json();
}

export async function getVideoSteps(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/video-steps`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Video steps failed");
  return await res.json();
}

export async function extractTools(issue: string) {
  const res = await fetch(`${BASE_URL}/tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  if (!res.ok) throw new Error("Tools extraction failed");
  return await res.json();
}

export async function extractToolsFromImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/tools`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Tools from image failed");
  return await res.json();
}

export async function getSafetyWarnings(issue: string) {
  const res = await fetch(`${BASE_URL}/safety`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  if (!res.ok) throw new Error("Safety warnings failed");
  return await res.json();
}

export async function runFixishFlow(file: File, issue?: string) {
  const form = new FormData();
  form.append("file", file);
  if (issue) form.append("issue", issue);
  const res = await fetch(`${BASE_URL}/fixish-flow`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Fix-ISH flow failed");
  return await res.json();
}

export async function quickDiagnose(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/quick-diagnose`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Quick diagnose failed");
  return await res.json();
}

export async function sendChat(message: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return (await res.json()).reply;
}

export async function analyzeImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/analyze-image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Image analysis failed");
  return (await res.json()).analysis;
}

export async function analyzeVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/analyze-video`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Video analysis failed");
  return (await res.json()).analysis;
}
