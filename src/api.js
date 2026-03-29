const SESSION_KEY = "fastagenda_session";
const USER_KEY    = "fastagenda_user";
const BASE        = "/api";

// ── Sesión / Auth ─────────────────────────────────────────────────────────────

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(SESSION_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginWithGoogle(credential) {
  const res = await fetch(`${BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error("Login fallido");
  const data = await res.json();
  localStorage.setItem(SESSION_KEY, data.sessionId);
  localStorage.setItem(USER_KEY, JSON.stringify({
    email:   data.email,
    name:    data.name,
    picture: data.picture,
  }));
  return { email: data.email, name: data.name, picture: data.picture };
}

// ── Fetch base ────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("No autenticado");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Tareas ────────────────────────────────────────────────────────────────────

export const getTasks   = ()           => apiFetch("/tasks");
export const saveTask   = (task)       => apiFetch("/tasks", { method: "POST", body: task });
export const toggleTask = (id, done)   => apiFetch("/tasks", { method: "PUT",  body: { id, done } });
export const deleteTask = (id)         => apiFetch(`/tasks?id=${id}`, { method: "DELETE" });

// ── Categorías ────────────────────────────────────────────────────────────────

export const getCategories  = ()     => apiFetch("/categories");
export const saveCategories = (cats) => apiFetch("/categories", { method: "POST", body: cats });

// ── Notas ─────────────────────────────────────────────────────────────────────

export const getNotes  = ()                          => apiFetch("/notes");
export const saveNote  = (monthKey, text, checklist) =>
  apiFetch("/notes", { method: "POST", body: { monthKey, text, checklist } });
