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
| **Backend** | Node.js 18+ · Express 5 · ES Modules |
| **AI Gateway** | OpenRouter API (cascading free-tier model chain) |
| **CV Parsing** | `pdf-parse` (PDFs) · `mammoth` (DOCX) |
| **Real-time** | Server-Sent Events (SSE) for live scoring progress |
| **Frontend** | Vite · React 18 · Zustand |
| **Styling** | Vanilla CSS (dark glassmorphism design) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A free [OpenRouter](https://openrouter.ai) API key

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
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL=openrouter/owl-alpha        # primary free model (auto-cascades on 429/404)
PORT=3001
MAX_CONCURRENT_AI_CALLS=8
AI_CALL_TIMEOUT_MS=50000
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev
# → http://localhost:3001

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

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/jd/parse` | Parse JD from text or uploaded file |
| `POST` | `/api/cv/parse-batch` | Batch parse CV files (PDF/DOCX, max 50) |
| `POST` | `/api/score/batch` | Start async AI scoring job → returns `{ jobId }` |
| `GET`  | `/api/score/progress/:jobId` | SSE stream — progress + final ranked results |
| `POST` | `/api/bias/check` | Bias analysis on the shortlisted candidates |
| `POST` | `/api/interview/questions` | Generate 12 tailored interview questions |
| `GET`  | `/api/health` | Health check |

---

## ⚙️ Environment Variables

```env
OPENROUTER_API_KEY=          # Required — your OpenRouter key
OPENROUTER_BASE_URL=         # https://openrouter.ai/api/v1
MODEL=                       # Primary model (fallback chain kicks in on 429/404)
PORT=3001                    # Backend port
MAX_CONCURRENT_AI_CALLS=8    # Parallel AI requests during batch scoring
AI_CALL_TIMEOUT_MS=50000     # Per-request hard timeout (ms)
```

---

## 📁 Project Structure

```
Recruitor/
├── backend/
│   ├── controllers/         # Route handlers (JD, CV, Score, Bias, Interview)
│   ├── services/
│   │   ├── openrouter.service.js   # AI call orchestrator with model cascade
│   │   ├── parser.service.js       # PDF/DOCX text extraction
│   │   └── prompts.js              # All LLM system prompts
│   ├── routes/              # Express routers
│   ├── middleware/          # Error handling, request validation
│   └── server.js            # Express app + SSE job store
└── frontend/
    └── src/
        ├── api/client.js    # Axios API client (all backend calls)
        ├── store/           # Zustand global state
        ├── components/
        │   ├── layout/      # App shell, Sidebar navigation
        │   ├── steps/       # One component per workflow step (Step1–Step5)
        │   └── ui/          # Reusable atoms (CandidateCard, ScoreRing, etc.)
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
