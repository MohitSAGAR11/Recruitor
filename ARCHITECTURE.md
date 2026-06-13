# RecruitAI — Architecture

This document explains how the entire system fits together — from a user clicking "Score Candidates" to a ranked list appearing on screen.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (React + Vite)                        │
│                                                                      │
│  Zustand (useAuthStore, useRecruitStore) ──► API Client (Axios)      │
│       ▲                                            │                 │
│       └────────── State / JWT updates ─────────────┘                 │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │  HTTP / SSE (JWT Bearer Token)
┌────────────────────────────────▼─────────────────────────────────────┐
│                    Express Backend (Node.js)                          │
│                                                                      │
│  Routes ──► Auth Middleware ──► Controllers ──► Services             │
│                   │                 │              │                 │
│                   │                 │              ▼                 │
│                   │                 │        llm.service.js          │
│                   │                 │        (Multi-provider gateway)│
│                   │                 │        / \   / \   / \         │
│                   │                 │      Groq Cerebras Gemini OR   │
│                   │                 │                                │
│                   ▼                 ▼                                │
│             Postgres DB        SSE Job Store                         │
│             (Supabase)         (in-memory Map)                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow — Step by Step

### Authentication & Session Recovery Flow (Boot & Login)

1. On App boot, `useAuthStore.init()` checks LocalStorage for a JWT token.
2. If a token exists, it makes an authenticated `GET /api/auth/me` request to validate and restore the user's session.
3. If no token exists, the user is redirected to the `AuthScreen` (`components/auth/AuthScreen.jsx`) to register (`POST /api/auth/signup`) or log in (`POST /api/auth/login`).
4. On successful auth, a stateless JWT is returned and stored in LocalStorage. An Axios interceptor in `api/client.js` automatically appends this token as a Bearer authorization header to all future requests.

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

**Bias Check & Auto-Save Session** (triggered automatically after scoring completes):
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
       │
       ▼
persistCurrentSession() [useRecruitStore]
       │
       ▼
POST /api/sessions  { title, jd, candidates, biasReport }  (Auth Required)
       │
       ▼
session.controller.js  →  Appends screening to PostgreSQL screening_sessions
       │
       ▼
Returns: { id, title, candidate_count, created_at }
       │
       ▼
Stored in Zustand: currentSessionId
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

## AI Layer — Multi-Provider Gateway & Key Rotation

All AI requests are routed through `llm.service.js` (with a compatibility shim `openrouter.service.js`), implementing a multi-provider gateway. It balances key-rotation, rate-limit buckets, and provider failover:

```
callAI(systemPrompt, userContent, { maxTokens, tier })
       │
       ▼
Determine Model Chain based on Tier (Fast vs. Quality)
       │
       ▼
Select primary provider (Groq)
       │
       ├─ Rotate key pool (spread load across multiple developer accounts)
       │
       ├─ Try calling provider API
       │    ├─ Success: parse JSON & return
       │    └─ Status 429: rotate to next API key instantly (different quota pool)
       │
       ▼ Fallback on other status / key exhaustion
Try next provider in chain:
  1. Groq (llama-3.3-70b-versatile, openai/gpt-oss-120b, llama-3.1-8b-instant)
  2. Cerebras (gpt-oss-120b, zai-glm-4.7)
  3. Gemini (gemini-2.0-flash)
  4. OpenRouter (kimi-k2.6:free)
       │
       ▼ Success
safeParseJSON(rawText)
  ├─ Fast path: Strip ```json fences & parse
  └─ Fallback: Brace-matching scanner finds first balanced { ... } or [ ... ]
       │
       ▼
Return to controller
```

### Key Routing Principles
1. **Tier Isolation**: 
   - **Fast tier** (JD/CV parsing) uses cheaper, smaller models (`llama-3.1-8b-instant`).
   - **Quality tier** (Scoring, bias audit, interview generation) uses reasoning/larger models (`llama-3.3-70b-versatile`, `gpt-oss-120b`).
   - Since Groq applies rate limits per-model, isolating these tiers effectively doubles the concurrent request capacity.
2. **Instant Rotation on 429**: Rate limits on free tiers are hit quickly. By passing comma-separated lists of keys in `.env` (e.g. `GROQ_API_KEYS=key1,key2`), the gateway automatically rotates keys to spread the load.
3. **Resilient JSON Parser**: Models like `gpt-oss-120b` or Gemini often print thought logs or introductory comments before outputting JSON. The brace-matching parser scans past this commentary to extract only the valid JSON payload, preventing parsing crashes.

---

## Frontend Architecture

```
main.jsx
  └─ App.jsx
       ├─ AuthScreen.jsx       ← renders if user is not logged in (Zustand: user === null)
       └─ Dashboard Layout
            ├─ Sidebar.jsx     ← step navigation, history toggle, logout
            ├─ Step content area
            │    ├─ Step1_JD.jsx        (currentStep === 1)
            │    ├─ Step2_Upload.jsx    (currentStep === 2)
            │    ├─ Step3_Scoring.jsx   (currentStep === 3)
            │    └─ Step4_Results.jsx   (currentStep === 4)
            │         ├─ CandidateCard.jsx
            │         ├─ CandidateDetail.jsx
            │         │    ├─ ScoreRing.jsx
            │         │    └─ SkillChip.jsx
            │         ├─ BiasAlert.jsx
            │         └─ Step5_Interview.jsx  (inline 3rd column drawer)
            └─ HistoryPanel.jsx  ← slide-over drawer showing saved Postgres screenings
```

### State Management (Zustand)

State is divided into two stores:

#### `useAuthStore` (Auth State)
```
{
  user,                 // Logged-in user info { id, email, name }
  authReady,            // Checked LocalStorage on boot
  authLoading,          // Signup/login in progress
  authError,            // Active auth error message
}
```

#### `useRecruitStore` (Screening State)
```
{
  currentStep,          // Active step (1-4)
  jdRawText,            // Raw job description input
  parsedJD,             // Structured JD output from AI
  uploadedFiles[],      // Selected CV files
  parsedCandidates[],   // Parsed candidates list
  isScoringActive,      // True when active SSE progress stream is active
  scoringProgress,      // Progress score (0-100)
  rankedCandidates[],   // Scored & sorted candidates
  biasReport,           // Shortlist bias report
  interviewQuestions{}, // Cached guides, keyed by candidate name
  currentSessionId,     // Active Postgres screening session ID
  savedSessions[],      // Past screenings metadata (for HistoryPanel)
  showHistory,          // Toggle visibility of HistoryPanel
}
```

---

## Backend Architecture

```
server.js
  ├─ Express app setup & CORS validation (for Netlify production domains)
  ├─ sseJobStore = new Map()           ← shared in-memory active scoring job state
  └─ Route mounting:
       /api/auth      → auth.routes.js      → auth.controller.js (no-auth)
       /api/jd        → jd.routes.js        → jd.controller.js   (no-auth)
       /api/cv        → cv.routes.js        → cv.controller.js   (no-auth)
       /api/score     → score.routes.js     → score.controller.js (no-auth)
       /api/bias      → bias.routes.js      → bias.controller.js (no-auth)
       /api/interview → interview.routes.js → interview.controller.js (no-auth)
       /api/sessions  → session.routes.js   → session.controller.js (requireAuth)
```

### Database & Auth Primitives
- **`db/pool.js`**: Connects to the Supabase PostgreSQL cluster using `pg.Pool`. Handles connection tests on server boot.
- **`services/auth.service.js`**: Controls login hashing via `bcryptjs` and token creation/verification using `jsonwebtoken` (JWT).

### Middleware
- **`auth.middleware.js`**: Validates the `Authorization: Bearer <JWT>` header, attaching user payload `req.user = { id, email }` on protected routes.
- **`error.middleware.js`**: Universal global error catcher. Sanitizes and outputs `{ success: false, error, code }` payloads.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **SSE over WebSockets** | Simpler server-side (no WS library), unidirectional push is all scoring progress needs |
| **In-memory job store** | Keeps active scoring stream isolated from DB overhead; client auto-saves to DB *only* when scoring finishes |
| **PostgreSQL Session History** | Restoring past screenings from Supabase solves state loss on server/client restarts, transforming the MVP into a production SaaS product |
| **Multi-Provider LLM Fallback** | Rotating through Groq, Cerebras, Gemini, and OpenRouter ensures that even if one free-tier API goes down, the application remains fully functional |
| **API Key Pools & Rotation** | Avoids early exhaustion of rate limits by distributing the request payload load evenly across multiple keys |
| **Brace-Matching JSON Extractor** | Handles reasoning tokens and conversational filler printed by models like Cerebras and DeepSeek, extracting purely the JSON data |
| **Stateless JWT Auth** | Eliminates session-store db queries on every request, reducing server latency and keeping routing stateless |
| **Dual Store Setup** | Splitting authentication into `useAuthStore` and screen configuration into `useRecruitStore` keeps Zustand modules focused and clean |
| **Interview questions cached** | Prevents redundant API costs and loading states when reopening candidate profiles |
