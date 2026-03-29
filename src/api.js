// Recupera el ID de sesión del usuario (establecido tras el login con Google)
function getSessionId() {
  return localStorage.getItem("fastagenda_session") || "";
}

const BASE = "/api";

async function apiFetch(path, options = {}) {
  const sessionId = getSessionId();
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

export async function initSession() {
  const id = getSessionId();
  await fetch(`${BASE}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: id }),
  });
  return id;
}

// TASKS
export const getTasks      = ()       => apiFetch("/tasks");
export const saveTask      = (task)   => apiFetch("/tasks", { method: "POST", body: task });
export const toggleTask    = (id, done) => apiFetch("/tasks", { method: "PUT",  body: { id, done } });
export const deleteTask    = (id)     => apiFetch(`/tasks?id=${id}`, { method: "DELETE" });

// CATEGORIES
export const getCategories  = ()     => apiFetch("/categories");
export const saveCategories = (cats) => apiFetch("/categories", { method: "POST", body: cats });

// NOTES
export const getNotes  = ()                        => apiFetch("/notes");
export const saveNote  = (monthKey, text, checklist) =>
  apiFetch("/notes", { method: "POST", body: { monthKey, text, checklist } });
