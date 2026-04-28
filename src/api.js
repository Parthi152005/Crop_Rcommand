const APP_API_BASE = process.env.REACT_APP_API_BASE || "/api";
const ML_API_BASE = process.env.REACT_APP_ML_API_BASE;

async function readResponseData(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return { error: text || "Request failed" };
}

function normalizeError(error, fallbackMessage = "Request failed") {
  if (error?.name === "TypeError") {
    return new Error("Unable to reach ML backend. Ensure backend is running at REACT_APP_ML_API_BASE.");
  }
  return new Error(error?.message || fallbackMessage);
}

async function callApi(base, path, payload) {
  try {
    const response = await fetch(`${base}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await readResponseData(response);
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Request failed");
    }
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function callGet(base, path) {
  try {
    const response = await fetch(`${base}/${path}`);
    const data = await readResponseData(response);
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Request failed");
    }
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function callMultipart(base, path, formData) {
  try {
    const response = await fetch(`${base}/${path}`, {
      method: "POST",
      body: formData
    });
    const data = await readResponseData(response);
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Request failed");
    }
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

function requireMlApi() {
  if (!ML_API_BASE) {
    throw new Error("Missing REACT_APP_ML_API_BASE environment variable.");
  }
}

export function analyzeLand(payload) {
  requireMlApi();
  return callApi(ML_API_BASE, "analyze-land", payload);
}

export function predictCrop(payload) {
  requireMlApi();
  return callApi(ML_API_BASE, "predict-crop", payload);
}

export function detectDisease(payload) {
  requireMlApi();
  return callApi(ML_API_BASE, "detect-disease", payload);
}

export function getFertilizerPlan(payload) {
  if (ML_API_BASE) {
    return callApi(ML_API_BASE, "fertilizer-plan", payload).catch(() =>
      callApi(APP_API_BASE, "fertilizer-plan", payload)
    );
  }
  return callApi(APP_API_BASE, "fertilizer-plan", payload);
}

export function predictSoilFromImage(file) {
  requireMlApi();
  const formData = new FormData();
  formData.append("image", file);
  return callMultipart(ML_API_BASE, "predict", formData);
}

export function validateSoilImage(file) {
  requireMlApi();
  const formData = new FormData();
  formData.append("image", file);
  return callMultipart(ML_API_BASE, "validate-soil-image", formData);
}

export function predictSoilManual(payload) {
  requireMlApi();
  return callApi(ML_API_BASE, "predict-manual", payload);
}

export function getPredictionHistory() {
  requireMlApi();
  return callGet(ML_API_BASE, "history");
}
