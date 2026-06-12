import { create } from 'zustand';
import {
  parseJD as apiParseJD,
  parseCVBatch as apiParseCVBatch,
  scoreBatch as apiScoreBatch,
  checkBias as apiCheckBias,
  getInterviewQuestions as apiGetInterviewQuestions,
  saveSession as apiSaveSession,
  listSessions as apiListSessions,
  getSession as apiGetSession,
  deleteSession as apiDeleteSession,
  saveInterviewGuide as apiSaveInterviewGuide,
} from '../api/client.js';
import { API_ORIGIN } from '../api/client.js';
import { DEMO_CANDIDATES, DEMO_JD_TEXT } from '../utils/mockData.js';

let sseSource = null;

const useRecruitStore = create((set, get) => ({
  // ── Navigation ────────────────────────────────────────────
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),

  // ── Step 1: Job Description ───────────────────────────────
  jdRawText: '',
  parsedJD: null,
  setJdRawText: (text) => set({ jdRawText: text }),

  // ── Step 2: CV Upload ─────────────────────────────────────
  uploadedFiles: [],       // [File objects from dropzone]
  parsedCandidates: [],    // [{ filename, parsed, rawText, status }]
  setUploadedFiles: (files) => set({ uploadedFiles: files }),

  // ── Step 3: Scoring ───────────────────────────────────────
  isScoringActive: false,  // true only while SSE job is running
  scoringProgress: 0,
  scoringCurrent: 0,
  scoringTotal: 0,
  scoringLatestName: '',
  rankedCandidates: [],    // sorted by score, with rank + shortlisted flag

  // ── Step 4: Results ───────────────────────────────────────
  selectedCandidateIndex: 0,
  biasReport: null,

  // ── Step 5: Interview ─────────────────────────────────────
  interviewQuestions: {},  // keyed by candidate name
  activeInterviewCandidate: null,
  showInterviewDrawer: false,

  // ── History / persistence ─────────────────────────────────
  currentSessionId: null,  // id of the saved screening (set after auto-save)
  savedSessions: [],       // list of past screenings (lightweight)
  sessionsLoading: false,
  showHistory: false,

  // ── UI ────────────────────────────────────────────────────
  loading: false,
  loadingMessage: '',
  error: null,
  toasts: [],

  // ── Helpers ───────────────────────────────────────────────
  setLoading: (loading, message = '') => set({ loading, loadingMessage: message }),
  setError: (error) => set({ error }),

  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ── Action: Load Demo JD ──────────────────────────────────
  loadDemoJD: () => set({ jdRawText: DEMO_JD_TEXT }),

  // ── Action: Parse JD ─────────────────────────────────────
  parseJD: async (text, file) => {
    const { addToast } = get();
    set({ loading: true, loadingMessage: 'Parsing job description…', error: null });
    try {
      const result = await apiParseJD(text, file);
      set({ parsedJD: result.data, loading: false, loadingMessage: '' });
      addToast('Job description parsed successfully', 'success');
    } catch (err) {
      set({ loading: false, loadingMessage: '', error: err.message });
      addToast(err.message, 'error');
    }
  },

  // ── Action: Load Demo CVs ─────────────────────────────────
  loadDemoCVs: () => {
    const { addToast } = get();
    const mockParsed = DEMO_CANDIDATES.map((c, i) => ({
      filename: `${c.name.replace(/\s+/g, '_')}_CV.pdf`,
      parsed: c,
      rawText: `Mock CV text for ${c.name}`,
      status: 'success',
    }));
    set({ parsedCandidates: mockParsed, uploadedFiles: [] });
    addToast(`Loaded ${DEMO_CANDIDATES.length} demo candidates`, 'success');
  },

  // ── Action: Parse CVs ─────────────────────────────────────
  parseCVBatch: async (files) => {
    const { addToast } = get();
    set({ loading: true, loadingMessage: `Parsing ${files.length} CVs…`, error: null });
    try {
      const result = await apiParseCVBatch(files);
      set({ parsedCandidates: result.data, loading: false, loadingMessage: '' });
      addToast(`${result.summary.succeeded}/${result.summary.total} CVs parsed successfully`, 'success');
    } catch (err) {
      set({ loading: false, loadingMessage: '', error: err.message });
      addToast(err.message, 'error');
    }
  },

  // ── Action: Score Candidates (SSE) ────────────────────────
  scoreCandidates: async () => {
    const { parsedJD, parsedCandidates, addToast } = get();
    if (!parsedJD || parsedCandidates.length === 0) return;

    const successCandidates = parsedCandidates.filter((c) => c.status === 'success');
    set({
      currentStep: 3,
      isScoringActive: true,
      scoringProgress: 0,
      scoringCurrent: 0,
      scoringTotal: successCandidates.length,
      scoringLatestName: '',
      rankedCandidates: [],
    });

    try {
      const result = await apiScoreBatch(parsedJD, successCandidates);
      const { jobId } = result;

      // Close any existing SSE connection
      if (sseSource) sseSource.close();

      sseSource = new EventSource(`${API_ORIGIN}/api/score/progress/${jobId}`);

      sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'progress') {
            set({
              scoringProgress: data.progress,
              scoringCurrent: data.current,
              scoringTotal: data.total,
              scoringLatestName: data.latestName,
            });
          }

          if (data.type === 'done') {
            sseSource.close();
            sseSource = null;
            set({
              rankedCandidates: data.candidates,
              scoringProgress: 100,
              isScoringActive: false,
              currentStep: 4,
            });
            // Auto-trigger bias check on top 10
            const shortlist = data.candidates.filter((c) => c.shortlisted);
            get().checkBias(shortlist, data.candidates);
            addToast('Candidates scored and ranked!', 'success');
          }

          if (data.type === 'error') {
            sseSource.close();
            sseSource = null;
            set({ error: data.message, isScoringActive: false });
            addToast(data.message, 'error');
          }
        } catch (parseErr) {
          console.error('[SSE] Failed to parse event:', parseErr);
        }
      };

      sseSource.onerror = () => {
        if (sseSource) sseSource.close();
        sseSource = null;
        set({ isScoringActive: false });
        addToast('Lost connection during scoring — please retry', 'error');
      };
    } catch (err) {
      set({ error: err.message });
      addToast(err.message, 'error');
    }
  },

  // ── Action: Check Bias ────────────────────────────────────
  checkBias: async (shortlist, allCandidates) => {
    const { addToast } = get();
    try {
      const result = await apiCheckBias(shortlist, allCandidates);
      set({ biasReport: result.data });
      if (result.data?.biasDetected) {
        addToast('⚠️ Potential bias detected in shortlist', 'warning');
      }
    } catch (err) {
      console.warn('[checkBias] Failed:', err.message);
    }
    // Persist the completed screening (with or without bias) so it shows in history
    get().persistCurrentSession();
  },

  // ── Action: Persist current screening to history ──────────
  persistCurrentSession: async () => {
    const { parsedJD, rankedCandidates, biasReport, interviewQuestions, currentSessionId } = get();
    if (currentSessionId || !rankedCandidates.length || !parsedJD) return; // save once
    try {
      const res = await apiSaveSession({
        title: parsedJD.title,
        jd: parsedJD,
        candidates: rankedCandidates,
        biasReport,
        interviews: interviewQuestions,
      });
      set({ currentSessionId: res.data.id });
    } catch (err) {
      console.warn('[persistCurrentSession] Failed:', err.message);
    }
  },

  // ── Action: Fetch history list ────────────────────────────
  fetchSessions: async () => {
    set({ sessionsLoading: true });
    try {
      const res = await apiListSessions();
      set({ savedSessions: res.data || [], sessionsLoading: false });
    } catch (err) {
      set({ sessionsLoading: false });
      console.warn('[fetchSessions] Failed:', err.message);
    }
  },

  // ── Action: Open a past screening ─────────────────────────
  loadSession: async (id) => {
    const { addToast } = get();
    set({ loading: true, loadingMessage: 'Loading screening…' });
    try {
      const res = await apiGetSession(id);
      const s = res.data;
      set({
        parsedJD: s.jd,
        rankedCandidates: s.candidates || [],
        biasReport: s.bias_report || null,
        interviewQuestions: s.interviews || {},
        currentSessionId: s.id,
        currentStep: 4,
        selectedCandidateIndex: 0,
        showHistory: false,
        showInterviewDrawer: false,
        loading: false,
        loadingMessage: '',
      });
    } catch (err) {
      set({ loading: false, loadingMessage: '' });
      addToast(err.message, 'error');
    }
  },

  // ── Action: Delete a past screening ───────────────────────
  deleteSession: async (id) => {
    try {
      await apiDeleteSession(id);
      set((s) => ({ savedSessions: s.savedSessions.filter((x) => x.id !== id) }));
    } catch (err) {
      get().addToast(err.message, 'error');
    }
  },

  // ── Action: Start a fresh screening ───────────────────────
  startNewScreening: () => set({
    currentStep: 1,
    jdRawText: '',
    parsedJD: null,
    uploadedFiles: [],
    parsedCandidates: [],
    rankedCandidates: [],
    biasReport: null,
    interviewQuestions: {},
    currentSessionId: null,
    selectedCandidateIndex: 0,
    showInterviewDrawer: false,
    showHistory: false,
  }),

  setShowHistory: (show) => set({ showHistory: show }),

  // ── Action: Generate Interview Questions ──────────────────
  generateInterviewQuestions: async (candidateData) => {
    const { parsedJD, rankedCandidates, addToast, interviewQuestions } = get();
    const candidateName = candidateData.name || candidateData.parsed?.name || 'Candidate';

    // Return cached result if available
    if (interviewQuestions[candidateName]) {
      set({ activeInterviewCandidate: candidateData, showInterviewDrawer: true });
      return;
    }

    set({ loading: true, loadingMessage: `Generating interview guide for ${candidateName}…` });
    try {
      const candidateEntry = rankedCandidates.find(
        (c) => (c.name || c.parsed?.name || 'Candidate') === candidateName
      );
      const result = await apiGetInterviewQuestions(
        candidateData.parsed || candidateData,
        parsedJD,
        candidateEntry?.scores || {}
      );
      set((s) => ({
        interviewQuestions: { ...s.interviewQuestions, [candidateName]: result.data },
        loading: false,
        loadingMessage: '',
        activeInterviewCandidate: candidateData,
        showInterviewDrawer: true,
      }));
      addToast('Interview guide ready!', 'success');
      // Persist the guide onto the saved session (if this run is already saved)
      const sid = get().currentSessionId;
      if (sid) apiSaveInterviewGuide(sid, candidateName, result.data).catch(() => {});
    } catch (err) {
      set({ loading: false, loadingMessage: '' });
      addToast(err.message, 'error');
    }
  },

  closeInterviewDrawer: () => set({ showInterviewDrawer: false }),

  selectCandidate: (index) => set({ selectedCandidateIndex: index }),
}));

export default useRecruitStore;
