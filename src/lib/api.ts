const API_BASE = "http://localhost:8080/api";

export async function sendChat(message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.reply;
}

export async function getRepairSteps(issue: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  const data = await res.json();
  return data.steps;
}

export async function analyzeImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/analyze-image`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return data.analysis;
}

export async function analyzeVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/analyze-video`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return data.analysis;
}
