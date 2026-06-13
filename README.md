# RecruitAI — AI-Augmented Recruitment Platform

> End-to-end AI-powered screening pipeline: paste a JD, upload CVs, watch candidates scored and ranked in real time, detect bias, and generate tailored interview guides — all in one flow.

![RecruitAI](https://img.shields.io/badge/AI-OpenRouter-8B7CF6?style=flat-square) ![Stack](https://img.shields.io/badge/Stack-Node.js%20%2B%20React-4ADE80?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ Features

| Feature | Details |
|---|---|
| **JD Parsing** | AI extracts must-haves, nice-to-haves, skills, experience level from any job description text or uploaded file |
| **CV Batch Parsing** | Upload up to 50 PDF/DOCX CVs; text extracted with `pdf-parse` + `mammoth`, then AI-structured |
| **AI Scoring & Ranking** | Each candidate scored across 5 dimensions (skills, experience, education, culture, communication) with live SSE progress stream |
| **Bias Detection** | AI audits the shortlist for gender, ethnicity, age, disability, geography bias |
| **Interview Guide** | Generates 12 tailored questions per candidate (Technical, Behavioral, Gap-Probing, Culture) with difficulty and rationale |
| **Demo Mode** | Full demo with 15 realistic candidates and a fintech JD — no file uploads needed |

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 18+ · Express 5 · ES Modules · Postgres (Supabase via Supavisor pooler) |
| **AI Gateway** | Multi-provider LLM gateway (`llm.service.js`) with key rotation and cascading fallbacks across **Groq** (llama-3.1/3.3), **Cerebras** (gpt-oss-120b/zai-glm-4.7), **Gemini** (2.0 Flash), and **OpenRouter** (Kimi) |
| **Authentication**| Custom stateless JWT authentication with bcrypt password hashing |
| **History / DB**  | Persistent screening session store allowing saving, listing, and deleting past screenings |
| **CV Parsing** | `pdf-parse` (PDFs) · `mammoth` (DOCX) |
| **Real-time** | Server-Sent Events (SSE) for live scoring progress |
| **Frontend** | Vite · React 18 · Zustand |
| **Styling** | Vanilla CSS (dark glassmorphism design) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- At least one LLM API key (e.g., **Groq**, **Cerebras**, **Gemini**, or **OpenRouter**)
- A PostgreSQL database (e.g., free tier on **Supabase**) for user management and history

### 1. Clone & Install

```bash
git clone https://github.com/MohitSAGAR11/Recruitor.git
cd Recruitor

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
# Database & Authentication
DATABASE_URL=postgresql://postgres:...   # Postgres connection string
JWT_SECRET=your-secure-jwt-secret       # Random string for JWT tokens

# LLM Providers (comma-separate multiple keys to enable key-rotation / pool load spreading)
GROQ_API_KEYS=gsk_...
CEREBRAS_API_KEYS=csk_...
GEMINI_API_KEY=AIzaSy...
OPENROUTER_API_KEYS=sk-or-...

PORT=3001
MAX_CONCURRENT_AI_CALLS=8
AI_CALL_TIMEOUT_MS=50000
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev
# → http://localhost:3001 (or port specified in env)

# Terminal 2 — frontend
cd frontend && npm run dev
# → http://localhost:5173
```

---

## 🎮 Demo Flow (No File Uploads)

1. **Step 1 — Define Role** → Click **"Load Demo JD"** → **"Parse Job Description"**
2. **Step 2 — Upload CVs** → Click **"Load 15 Demo CVs"** (injects mock candidates directly)
3. **Step 3 — Score & Rank** → Click **"Score Candidates"** → watch live progress bar
4. **Step 4 — Review Results** → Browse ranked list, view score breakdowns, filter candidates, check bias report
5. **Step 5 — Interview Guide** → Click any candidate's **"Generate Interview Guide"** button, or use the sidebar

> ⚠️ A valid `OPENROUTER_API_KEY` is required even for demo mode (AI calls happen server-side).

---

## 🌐 API Reference

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET`  | `/api/auth/me` | Fetch active user's profile info | Yes |
| `POST` | `/api/jd/parse` | Parse JD from text or uploaded file | No |
| `POST` | `/api/cv/parse-batch` | Batch parse CV files (PDF/DOCX, max 50) | No |
| `POST` | `/api/score/batch` | Start async AI scoring job → returns `{ jobId }` | No |
| `GET`  | `/api/score/progress/:jobId` | SSE stream — progress + final ranked results | No |
| `POST` | `/api/bias/check` | Bias analysis on the shortlisted candidates | No |
| `POST` | `/api/interview/questions` | Generate 12 tailored interview questions | No |
| `GET`  | `/api/sessions` | List user's past screening sessions | Yes |
| `POST` | `/api/sessions` | Save a completed screening session | Yes |
| `GET`  | `/api/sessions/:id` | Retrieve detailed screening session | Yes |
| `PATCH` | `/api/sessions/:id/interviews` | Save candidate interview guide | Yes |
| `DELETE`| `/api/sessions/:id` | Delete a past screening session | Yes |
| `GET`  | `/api/health` | Health check | No |

---

## ⚙️ Environment Variables

```env
# Database & Auth
DATABASE_URL=                # Direct/Pooler connection string (PostgreSQL/Supabase)
JWT_SECRET=                  # Secret signing key for JWT tokens

# LLM Providers (supports rotation of multiple comma-separated keys)
GROQ_API_KEYS=               # Groq API keys (primary LLM provider)
CEREBRAS_API_KEYS=           # Cerebras API keys (overflow fallback)
GEMINI_API_KEY=              # Google Gemini API key (optional fallback)
OPENROUTER_API_KEYS=         # OpenRouter API keys (last-resort fallback)

PORT=3001                    # Backend port
MAX_CONCURRENT_AI_CALLS=8    # Parallel AI requests during batch scoring
AI_CALL_TIMEOUT_MS=50000     # Per-request hard timeout (ms)
CORS_ORIGIN=                 # Whitelisted frontend origin for CORS
```

---

## 📁 Project Structure

```
Recruitor/
├── backend/
│   ├── config/              # Central config loader
│   │   └── env.js           # Env validation & LLM key pooling config
│   ├── controllers/         # Route handlers (JD, CV, Score, Bias, Interview, Auth, Session)
│   ├── db/
│   │   └── pool.js          # Postgres database connection pool
│   ├── middleware/          # JWT verification, Error handling, request validation
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── routes/              # Express routers (Auth, Sessions, JD, CV, etc.)
│   ├── services/
│   │   ├── auth.service.js  # Password hashing (bcrypt) & JWT token signing
│   │   ├── llm.service.js   # Multi-provider LLM gateway, key rotation, JSON extraction
│   │   ├── openrouter.service.js # Backwards-compat shim
│   │   ├── parser.service.js # PDF/DOCX text extraction
│   │   └── prompts.js       # All LLM system prompts
│   └── server.js            # Express app + DB verification + SSE job store
└── frontend/
    └── src/
        ├── api/client.js    # Axios API client with interceptors for JWT
        ├── store/           # Zustand global state
        │   ├── useAuthStore.js    # Auth status, login, signup
        │   └── useRecruitStore.js # Screening session, history, and AI steps
        ├── components/
        │   ├── auth/        # Login/Signup screen
        │   ├── layout/      # App shell, Sidebar navigation
        │   ├── steps/       # Workflow steps (Step1–Step4, Step5 is inline)
        │   ├── ui/          # Reusable atoms (Toast, CandidateCard, ScoreRing, etc.)
        │   └── HistoryPanel.jsx   # Past screening screenings list drawer
        └── utils/mockData.js  # 15 demo candidates + demo JD text
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deep-dive into how each piece connects.

---

## 📝 Notes

- **Model Cascade**: If the primary model returns `404` or `429`, the service automatically tries the next free model in the chain (`openrouter/owl-alpha → nex-agi/nex-n2-pro:free → poolside/laguna-xs.2:free → nvidia/nemotron-3-nano:free`)
- **Scoring Parallelism**: Candidates scored with `p-limit(8)` — all 8 run concurrently for fastest possible batch completion
- **Token Optimisation**: Scoring uses slim payloads (skills + role, no raw highlights) with `max_tokens: 600`; interview generation uses `max_tokens: 1400`
- **SSE Job Store**: In-memory — don't restart the backend mid-scoring
- **PDF Images**: Image-based PDFs (< 100 extracted chars) return a warning prompting manual text paste
