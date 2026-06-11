import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s for large CV batches
  headers: { 'Content-Type': 'application/json' },
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

export default api;
