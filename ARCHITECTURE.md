# RecruitAI — Architecture

This document explains how the entire system fits together — from a user clicking "Score Candidates" to a ranked list appearing on screen.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (React + Vite)                        │
│                                                                      │
│  Zustand Store ──► Step Components ──► API Client (Axios)            │
│       ▲                                        │                     │
│       └────────── State updates ───────────────┘                     │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │  HTTP / SSE (localhost:3001)
┌────────────────────────────────▼─────────────────────────────────────┐
│                    Express Backend (Node.js)                          │
│                                                                      │
│  Routes ──► Controllers ──► Services ──► OpenRouter API (AI)        │
│                   │                                                  │
│             SSE Job Store (in-memory Map)                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow — Step by Step

### Step 1: Parse Job Description

```
User pastes JD text
       │
       ▼
POST /api/jd/parse
       │
       ▼
jd.controller.js
  └─ callAI(PARSE_JD_PROMPT, jdText)
       │
       ▼
openrouter.service.js   ← tries model chain until one succeeds
  └─ POST openrouter.ai/api/v1/chat/completions
       │
       ▼
Returns structured JSON:
  { title, mustHave[], niceToHave[], hardSkills[], softSkills[],
    experienceLevel, minYearsExperience, domainKnowledge[] }
       │
       ▼
Stored in Zustand: parsedJD
```

---

### Step 2: Upload / Parse CVs

```
User drops PDF/DOCX files
       │
       ▼
POST /api/cv/parse-batch  (multipart/form-data, max 50 files)
       │
       ▼
cv.controller.js
  ├─ parser.service.js → pdf-parse (PDF) / mammoth (DOCX) → rawText
  └─ callAI(PARSE_CV_PROMPT, rawText) → structured candidate JSON
       │
       ▼
Returns array: [{ filename, parsed: { name, skills[], workHistory[], ... }, status }]
       │
       ▼
Stored in Zustand: parsedCandidates[]
```

**Demo shortcut**: `loadDemoCVs()` in the store injects 15 pre-built mock candidates from `utils/mockData.js` directly, bypassing the API call entirely.

---

### Step 3: Score & Rank (SSE Pipeline)

This is the most complex flow — it uses Server-Sent Events for real-time progress.

```
User clicks "Score Candidates"
       │
       ▼
POST /api/score/batch   { jd, candidates[] }
       │
       ▼
score.controller.js
  1. Generates a UUID jobId
  2. Creates job entry in sseJobStore (shared in-memory Map in server.js)
  3. Returns { jobId } immediately (HTTP 200)
  4. Kicks off processScoringJob() in the background (no await)

       │
       ▼ (background, async)

processScoringJob(jobId, jd, candidates)
  └─ pLimit(8) — up to 8 parallel AI calls

  For each candidate:
    buildScoringPayload(jd, candidate)   ← slim payload, ~40% fewer tokens
        │
        ▼
    callAI(SCORE_CANDIDATE_PROMPT, payload, { maxTokens: 600 })
        │
        ▼
    Returns score JSON:
      { overallScore, categoryScores: { skills, experience, education,
        culture, communication }, matchedMustHave[], missingMustHave[],
        strengthSummary, gapSummary, interviewFocus[] }
        │
        ▼
    broadcastSSE(jobId, { type: 'progress', ... })  → all connected clients

  After all candidates:
    Sort by overallScore desc, assign rank + shortlisted (top 10)
    broadcastSSE(jobId, { type: 'done', candidates: rankedCandidates })

               ┌────────────────────────────────────────┐
               │       Browser (SSE client)             │
               │                                        │
               │  GET /api/score/progress/:jobId        │
               │  (EventSource — persistent connection) │
               │       │                                │
               │       ▼ on 'progress' event            │
               │  Update Zustand:                       │
               │    scoringProgress, scoringCurrent...  │
               │       │                                │
               │       ▼ on 'done' event                │
               │  Set rankedCandidates in store         │
               │  Auto-navigate to Step 4               │
               │  Trigger checkBias() in background     │
               └────────────────────────────────────────┘
```

---

### Step 4: Review Results

```
Zustand: rankedCandidates[] → Step4_Results.jsx
  │
  ├─ Left panel: CandidateCard list (filterable)
  │    └─ Filter: All / Shortlisted / Top 25% / Top 50%
  │         └─ Rendered via React Portal (escapes backdrop-filter stacking context)
  │
  ├─ Right panel: CandidateDetail (selected candidate)
  │    ├─ ScoreRing (SVG animated ring)
  │    ├─ Category score bars
  │    ├─ Must-have match list
  │    └─ Strength/Gap summaries
  │
  └─ BiasAlert (if biasReport.biasDetected)
       └─ Shown as warning banner at top of left panel
```

**Bias Check** (triggered automatically after scoring completes):
```
checkBias(shortlist, allCandidates)
       │
       ▼
POST /api/bias/check
       │
       ▼
bias.controller.js
  └─ callAI(BIAS_CHECK_PROMPT, { shortlist, allCandidates })
       │
       ▼
Returns: { biasDetected, biasTypes[], affectedGroups[], recommendation }
       │
       ▼
Stored in Zustand: biasReport
```

---

### Step 5: Interview Guide

```
User clicks "Generate Interview Guide" on a candidate
(or clicks "Interview Guide" in the sidebar)
       │
       ▼
generateInterviewQuestions(candidateData)  [Zustand action]
  │
  ├─ Check cache: interviewQuestions[candidateName] exists?
  │    └─ YES → open drawer immediately (no API call)
  │
  └─ NO → POST /api/interview/questions
               │
               ▼
         interview.controller.js
           └─ buildSlimPayload(candidate, jd, scores)
               │
               ▼
           callAI(INTERVIEW_PROMPT, payload, { maxTokens: 1400 })
               │
               ▼
           Returns:
             { technicalQuestions[], behavioralQuestions[],
               gapProbingQuestions[], cultureQuestions[] }
           Each question: { question, rationale, difficulty, competency, gap? }
               │
               ▼
         Stored in Zustand: interviewQuestions[candidateName]
         showInterviewDrawer = true
               │
               ▼
         Step5_Interview renders as a 3rd column panel
         (inline flex sibling, no overlay/backdrop)
```

---

## AI Layer — Model Cascade

All AI calls go through `openrouter.service.js` which implements a **cascading model chain**:

```
callAI(systemPrompt, userContent, { maxTokens })
       │
       ▼
Try MODEL[0] (from .env, e.g. openrouter/owl-alpha)
       │
   ┌───┴────────────────────────┐
   │ 404 (model gone)           │ → try MODEL[1]
   │ 429 (rate limited)         │ → wait 500ms → try MODEL[1]
   │ empty choices[]            │ → try MODEL[1]
   │ other error                │ → retry once → try MODEL[1]
   └────────────────────────────┘
       │ on any cascade
       ▼
Try MODEL[1]: nex-agi/nex-n2-pro:free
Try MODEL[2]: poolside/laguna-xs.2:free
Try MODEL[3]: nvidia/nemotron-3-nano-omni:free
       │
       ▼ success
safeParseJSON(raw)  ← strips ```json fences, parses, returns object
       │
       ▼
Return to controller
```

All models are confirmed `price: "0"` on OpenRouter as of June 2026.

---

## Frontend Architecture

```
main.jsx
  └─ App.jsx
       ├─ Sidebar.jsx          ← step navigation (5 steps, unlocks progressively)
       └─ Step content area
            ├─ Step1_JD.jsx        (currentStep === 1)
            ├─ Step2_Upload.jsx    (currentStep === 2)
            ├─ Step3_Scoring.jsx   (currentStep === 3)
            └─ Step4_Results.jsx   (currentStep === 4)
                 ├─ CandidateCard.jsx    (left panel list items)
                 ├─ CandidateDetail.jsx  (right panel)
                 │    ├─ ScoreRing.jsx
                 │    └─ SkillChip.jsx
                 ├─ BiasAlert.jsx
                 └─ Step5_Interview.jsx  (inline 3rd column when open)
```

### State Management (Zustand)

All application state lives in `useRecruitStore`:

```
{
  currentStep,          // 1–4 (navigation)
  parsedJD,             // AI-extracted JD structure
  parsedCandidates[],   // CV parse results
  rankedCandidates[],   // Scored + ranked (from SSE done event)
  biasReport,           // Bias analysis result
  interviewQuestions{}, // Keyed by candidate name (cached)
  showInterviewDrawer,  // Toggle interview panel
  activeInterviewCandidate,
  isScoringActive,      // True while SSE scoring in progress
  scoringProgress,      // 0–100
  loading,              // Global loading overlay
  toasts[],             // Notification queue
}
```

---

## Backend Architecture

```
server.js
  ├─ Express app setup
  ├─ CORS (origin: http://localhost:5173)
  ├─ sseJobStore = new Map()   ← shared in-memory job state
  └─ Route mounting:
       /api/jd        → jd.routes.js        → jd.controller.js
       /api/cv        → cv.routes.js        → cv.controller.js
       /api/score     → score.routes.js     → score.controller.js
       /api/bias      → bias.routes.js      → bias.controller.js
       /api/interview → interview.routes.js → interview.controller.js
```

### Middleware

- `express.json({ limit: '50mb' })` — large CV text payloads
- `multer` — multipart file upload (CV batch)
- Error middleware — catches all unhandled errors, returns `{ success: false, error, code }`

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **SSE over WebSockets** | Simpler server-side (no WS library), unidirectional push is all scoring needs |
| **In-memory job store** | No DB dependency for MVP; trade-off: jobs lost on restart |
| **Model cascade** | Free tier models go down or rate-limit unpredictably; cascading ensures availability |
| **Slim scoring payload** | Full candidate JSON (~800 tokens) → stripped payload (~480 tokens) = ~40% faster inference |
| **React Portal for dropdown** | Parent has `backdrop-filter` which traps `position:fixed` children; portal escapes the stacking context |
| **Zustand (no Redux)** | Single-store, flat state, no boilerplate — appropriate for a linear 5-step wizard flow |
| **Interview questions cached** | Same candidate clicked twice → instant open, no second API call |
| **Demo candidates in-memory** | 15 mock CVs injected directly into store, bypassing CV parsing API — demos run faster and don't require file system access |
