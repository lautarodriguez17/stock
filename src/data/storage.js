const PREFIX = "kiosco_stock_v1:";
const ROLE_KEY = "currentRole";
const AUTH_KEY = "auth";

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function readRole(fallback) {
  try {
    return localStorage.getItem(ROLE_KEY) || fallback;
  } catch {
    return fallback;
  }
}

export function writeRole(role) {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // ignore storage errors
  }
}

export function readAuth(fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + AUTH_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeAuth(session) {
  localStorage.setItem(PREFIX + AUTH_KEY, JSON.stringify(session));
}

export function clearAuth() {
  localStorage.removeItem(PREFIX + AUTH_KEY);
}
