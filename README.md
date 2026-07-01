# Interview Prep AI

Interview Prep AI is a full-stack, AI-powered interview preparation platform. It helps candidates practice across **technical Q&A**, **coding rounds**, **behavioral (STAR) interviews**, **live mock interviews**, and **performance analytics** — all personalized to their role, resume, job description, and company style.

🌐 **Live Demo:** [prep-pilot-sssb.vercel.app](https://prep-pilot-sssb.vercel.app/)

---

## Features

### Phase 1 — Personalized Q&A Prep
- **Job Description Prep** — Paste or upload a JD; AI extracts skills and generates tailored questions
- **Resume-Based Prep** — Upload resume (PDF/DOCX); questions based on your actual stack
- **Resume + JD Matching** — Combined prep from both sources
- **Company-Specific Style** — Practice for Google, Amazon, Microsoft, Netflix, Uber, startup, and more
- **Manual Role Prep** — Pick role, experience, and focus topics
- **Session Management** — Create, organize, pin, and delete prep sessions
- **Concept Deep Dives** — “Learn More” AI explanations on any question

### Phase 2 — Coding Round Simulator
- **50+ coding challenges** (easy / medium / hard) with Monaco editor
- **Run Code** on visible test cases; **Submit** against hidden, edge, and stress tests
- **JavaScript execution** via local Node.js runner
- **Draft autosave** via Redis
- Submission history and results per challenge

### Phase 3 — STAR Behavioral Evaluation
- **108 behavioral questions** across **12 categories** (Leadership, Conflict, Teamwork, etc.)
- AI evaluation scored on **Situation, Task, Action, Result**
- Practice history and improvement suggestions

### Phase 4 — AI Mock Interview Simulator
- Live chat-based mock interviews with **dynamic AI follow-ups**
- Multiple interviewer personalities and session types
- JD/resume-aware interviews
- Detailed **feedback reports** and session history
- Rate limiting for fair API usage

### Phase 5 — Weakness Analytics & ATS Resume Analyzer
- **Resume-first analytics** — Upload a PDF resume to anchor weakness insights before platform activity builds up
- **ATS resume analysis** (Groq) — ATS score, strengths, weaknesses, missing skills, keyword match, formatting feedback, role fit, and improvement suggestions
- **Personalized learning roadmap** — AI-generated 4-week plan from resume gaps, weak topics, and target role
- Cross-module readiness scoring from **Q&A, coding, behavioral, and mock interview** data
- Combined weakness insights when both resume analysis and platform activity exist
- **Analytics dashboard** (`/analytics`) — resume ATS analysis, interview readiness, activity totals, weekly improvement chart, skill radar, learning roadmap, and AI recommendations
- Redis-cached dashboard and resume analysis (`resume:analysis:{userId}`, 24h TTL) with cache invalidation on new activity or resume upload

> **Note:** Phase 1 also supports resume/JD upload for question generation via `/api/documents`. Phase 5 resume upload (`/api/analytics/resume/upload`) is separate — it stores analysis in MongoDB and powers the analytics dashboard.

### Platform
- JWT authentication with bcrypt password hashing
- Responsive React UI (landing page, dashboard, module-specific layouts)
- Groq API for generation and evaluation
- Upstash Redis for caching, rate limits, and drafts (optional)

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router, Axios, Monaco Editor, Recharts, React Toastify, React Icons |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose), Groq SDK, Upstash Redis, JWT, bcryptjs, Multer |
| **Document parsing** | pdf-parse, mammoth (PDF/DOCX for JD & resume) |
| **Code execution** | Local JavaScript runner (Node.js child process) |
| **Deployment** | Vercel (frontend + backend), MongoDB Atlas, Upstash Redis |

---

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/dashboard` | Main hub — prep sessions + module navigation |
| `/interview-prep/:sessionId` | Q&A practice session |
| `/coding` | Coding challenge list |
| `/coding/:slug` | Individual coding challenge |
| `/behavioral` | Behavioral question browser |
| `/behavioral/:questionId` | STAR practice page |
| `/behavioral/history` | Behavioral submission history |
| `/mock-interview` | Start mock interview |
| `/mock-interview/session/:sessionId` | Live interview chat |
| `/mock-interview/report/:sessionId` | Interview report |
| `/mock-interview/history` | Past mock interviews |
| `/analytics` | Weakness analytics & ATS resume analyzer dashboard |

---

## API Overview

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, profile |
| `/api/sessions` | Q&A prep sessions |
| `/api/questions` | Question generation & management |
| `/api/documents` | JD/resume upload & parsing |
| `/api/companies` | Company interview styles |
| `/api/coding` | Challenges, run, submit, drafts |
| `/api/behavioral` | Behavioral questions & STAR evaluation |
| `/api/mock-interview` | Mock interview sessions & reports |
| `/api/analytics` | Dashboard, roadmap, recommendations, topic history |
| `/api/analytics/resume` | Resume upload (PDF), latest analysis, history, delete |

**Resume analytics endpoints**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analytics/resume/upload` | Upload PDF resume → extract text → AI analysis |
| `GET` | `/api/analytics/resume/latest` | Latest resume analysis for the user |
| `GET` | `/api/analytics/resume/history` | Past resume analyses (metadata only) |
| `DELETE` | `/api/analytics/resume/:id` | Delete a resume analysis record |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Groq API key
- Upstash Redis (optional but recommended)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd "Interview Prep AI"

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `GROQ_API_KEY` | Groq API key |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token (optional) |
| `AI_DAILY_LIMIT` | Max AI requests per user per day (default: `20`) |
| `MOCK_INTERVIEW_DAILY_LIMIT` | Mock interviews per day (default: `5`) |
| `MOCK_INTERVIEW_MSG_PER_MIN` | Mock interview messages per minute (default: `15`) |
| `GENERATE_AI_TEST_CASES` | `true` to enrich coding seeds with Groq-generated tests |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_APP_BACKEND_URL` | Backend URL (e.g. `http://localhost:8000`) |

Redis is optional. If Upstash vars are missing, the app runs without cache/rate limiting.

### 3. Seed the database

```bash
cd backend

# Coding challenges (50 problems)
node scripts/seedCodingChallenges.js

# Behavioral questions (108 questions)
node scripts/seedBehavioralQuestions.js
```

### 4. Run locally

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`

> **Note:** After adding new backend routes, restart the server. An old process on port 8000 may serve stale routes and return 404s.

---

## Coding Challenge Test Cases

Each challenge stores test cases in MongoDB:

| Field | Description |
|-------|-------------|
| `input` | JSON array of function arguments |
| `expected` | Expected return value |
| `type` | `visible`, `hidden`, `edge`, or `stress` |
| `isHidden` | Hides expected output from client |
| `explanation` | Why the case exists |
| `label` | Short display label |

- **Run Code** — visible examples only
- **Submit** — all tests (hidden show pass/fail only)

When seeding with `GENERATE_AI_TEST_CASES=true`, Groq can generate extra hidden/edge/stress cases. Seeding continues with manual cases if Groq fails.

---

## Project Structure

```
Interview Prep AI/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose schemas (incl. ResumeAnalysis, UserTopicAnalytics)
│   ├── routes/          # Express routes
│   ├── services/        # AI, analytics, resume analysis, code execution, caching
│   ├── data/            # Coding & behavioral question datasets
│   └── scripts/         # Seed & test scripts
├── frontend/
│   └── src/
│       ├── pages/       # Landing, dashboard, coding, behavioral, mock interview, analytics
│       ├── components/  # Shared UI
│       └── context/     # Auth state
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Vercel |
| Database | MongoDB Atlas |
| Cache | Upstash Redis |

Set `FRONTEND_URL` and `VITE_APP_BACKEND_URL` to your production URLs.

---

## License

ISC
