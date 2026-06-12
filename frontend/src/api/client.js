import axios from 'axios';

// In production the frontend (Vercel) and backend (Render) are on different
// domains, so point at VITE_API_BASE_URL. In dev it's empty → "/api" uses the
// Vite proxy. Exported so the SSE EventSource can build the same absolute URL.
export const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 60000, // 60s for large CV batches
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth token handling ────────────────────────────────────────────────
const TOKEN_KEY = 'recruitai_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Attach the JWT to every request if present
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Response interceptor — unwrap data, surface errors uniformly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';
    const err = new Error(message);
    err.code = code;
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

/** POST /api/jd/parse — text or file */
export async function parseJD(text, file) {
  if (file) {
    const fd = new FormData();
    fd.append('jdFile', file);
    return api.post('/jd/parse', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/jd/parse', { text });
}

/** POST /api/cv/parse-batch — array of File objects */
export async function parseCVBatch(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append('cvFiles', f));
  return api.post('/cv/parse-batch', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 min for large batches
  });
}

/** POST /api/score/batch — returns { jobId } */
export async function scoreBatch(jd, candidates) {
  return api.post('/score/batch', { jd, candidates });
}

/** POST /api/bias/check */
export async function checkBias(shortlist, allCandidates) {
  return api.post('/bias/check', { shortlist, allCandidates });
}

/** POST /api/interview/questions */
export async function getInterviewQuestions(candidate, jd, scores) {
  // 120s — handles worst-case free-tier model latency + fallback generation time
  return api.post('/interview/questions', { candidate, jd, scores }, { timeout: 120000 });
}

// ── Auth ──────────────────────────────────────────────────────────────
export async function signup(email, password, name) {
  return api.post('/auth/signup', { email, password, name });
}
export async function login(email, password) {
  return api.post('/auth/login', { email, password });
}
export async function fetchMe() {
  return api.get('/auth/me');
}

// ── Sessions (history) ────────────────────────────────────────────────
export async function listSessions() {
  return api.get('/sessions');
}
export async function getSession(id) {
  return api.get(`/sessions/${id}`);
}
export async function saveSession(payload) {
  return api.post('/sessions', payload);
}
export async function saveInterviewGuide(id, candidateName, questions) {
  return api.patch(`/sessions/${id}/interviews`, { candidateName, questions });
}
export async function deleteSession(id) {
  return api.delete(`/sessions/${id}`);
}

export default api;
