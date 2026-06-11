# RecruitAI — AI-Augmented Recruitment Platform

An AI-powered full-stack platform that semantically screens CVs against a job description, ranks candidates, detects bias, and generates tailored interview questions.

## Tech Stack
- **Backend**: Node.js + Express + OpenRouter (Claude 3.5 Sonnet)
- **Frontend**: Vite + React + Zustand
- **Parsing**: pdf-parse + mammoth (PDF/DOCX)
- **Real-time**: Server-Sent Events (SSE) for scoring progress

---

## Setup

### Prerequisites
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
npm run dev
```

Backend runs on: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Demo Flow (no file uploads needed)

1. **Step 1** — Click **"Load Demo JD"** → textarea fills with a realistic fintech JD → click **"Parse Job Description"**
2. **Step 2** — Click **"Load 15 Demo CVs"** → 15 varied candidates injected directly
3. Click **"Score Candidates"** → Step 3 shows live AI scoring progress via SSE
4. **Step 4** — Browse ranked candidates, read strengths/gaps, check bias report
5. Click **"Generate Interview Questions"** on any candidate → Step 5 drawer opens with 12 tailored questions

> ⚠️ The demo path requires a valid **OPENROUTER_API_KEY** in `backend/.env`. No file uploads are needed.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/jd/parse` | Parse job description (text or file) |
| POST | `/api/cv/parse-batch` | Batch parse CV files (max 50) |
| POST | `/api/score/batch` | Start async AI scoring, returns `jobId` |
| GET  | `/api/score/progress/:jobId` | SSE stream for scoring progress |
| POST | `/api/bias/check` | Bias analysis on shortlist |
| POST | `/api/interview/questions` | Generate tailored interview questions |

---

## Environment Variables

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL=anthropic/claude-3.5-sonnet
PORT=3001
MAX_CONCURRENT_AI_CALLS=5
```

---

## Notes

- **Concurrency**: All batch AI calls use `p-limit(5)` with 200ms inter-batch delay to respect OpenRouter rate limits
- **JSON safety**: All AI responses are stripped of markdown fences before parsing, with retry on failure
- **PDF images**: If a PDF appears to be image-based (< 100 extracted chars), a warning is returned prompting manual text paste
- **In-memory SSE**: The scoring job store is in-memory — don't restart the backend while a scoring job is in progress
