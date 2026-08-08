// ---------------------------------------------------------------
// API configuration
// ---------------------------------------------------------------
// This points at the CloudFront HTTPS distribution sitting in front
// of the Elastic Beanstalk backend. If the CloudFront URL ever
// changes, this is the only line that needs updating.
const API_BASE = "https://d3esaeltb25eub.cloudfront.net";

// Adjust these if your actual route paths differ (check
// backend/src/routes/authRoutes.ts and assetRoutes.ts to confirm).
const ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  assets: "/assets",
  checkout: (id) => `/assets/${id}/checkout`,
  checkin: (id) => `/assets/${id}/checkin`,
};

function getToken() {
  return localStorage.getItem("acs_token");
}

function setToken(token) {
  localStorage.setItem("acs_token", token);
}

function clearToken() {
  localStorage.removeItem("acs_token");
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}