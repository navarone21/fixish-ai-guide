const BASE_URL = "http://localhost:5050";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson
      ? payload?.error || payload?.message || "Request failed"
      : payload || response.statusText;
    throw new Error(message);
  }

  return payload;
}

async function postJSON(path, body = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

async function uploadBinary(path, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export const processFrame = (payload = {}) => postJSON("/process", payload);

export const uploadImage = (file) => {
  if (!file) {
    throw new Error("No image file provided");
  }
  return uploadBinary("/upload_image", file);
};

export const uploadAudio = (file) => {
  if (!file) {
    throw new Error("No audio file provided");
  }
  return uploadBinary("/upload_audio", file);
};

export const predictTools = (payload = {}) => postJSON("/predict_tools", payload);

export const getFuture = (payload = {}) => postJSON("/future", payload);

export const FixishTaskAPI = {
  processFrame,
  uploadImage,
  uploadAudio,
  predictTools,
  getFuture,
};
