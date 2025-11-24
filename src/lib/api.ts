const API_BASE = "http://localhost:8080/api";

export async function sendChat(message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return (await res.json()).reply;
}

export async function getRepairSteps(issue: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  return (await res.json()).steps;
}

export async function analyzeImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze-image`, {
    method: "POST",
    body: form,
  });
  return (await res.json()).analysis;
}

export async function analyzeVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze-video`, {
    method: "POST",
    body: form,
  });
  return (await res.json()).analysis;
}
