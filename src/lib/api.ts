const API_BASE = "http://localhost:8080/api";

export async function detectImage(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/detect`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Detection API failed");
  }

  return await res.json();
}
