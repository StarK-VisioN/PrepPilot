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
- **JWT authentication** with bcrypt password hashing
- **Google OAuth sign-in** — Continue with Google on login/signup; optional account linking for local users
- **Forgot / reset password** — Email-based reset flow via Nodemailer SMTP (30-minute single-use tokens)
- **Profile management** — Edit name, upload/remove avatar (JPG, PNG, WEBP, max 2MB)
- **Cloudinary avatars** — Profile images stored in Cloudinary (localhost and Vercel use the same storage when configured)
- Responsive React UI (landing page, dashboard, module-specific layouts)
- Groq API for generation and evaluation
- Upstash Redis for caching, rate limits, and drafts (optional)

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router, Axios, `@react-oauth/google`, Monaco Editor, Recharts, React Toastify |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose), Groq SDK, Upstash Redis, JWT, bcryptjs, Multer, Nodemailer, Cloudinary |
| **Document parsing** | pdf-parse, mammoth (PDF/DOCX for JD & resume) |
| **Code execution** | Local JavaScript runner (Node.js child process) |
| **Deployment** | Vercel (frontend + backend), MongoDB Atlas, Upstash Redis |

---

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in (email/password or Google) |
| `/forgot-password` | Request password reset link |
| `/reset-password/:token` | Set a new password from email link |
| `/auth/google/callback` | Google OAuth redirect callback (redirect flow) |
| `/settings/profile` | Edit profile, avatar, and connected accounts |
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
| `/api/auth` | Register, login, Google OAuth, profile, logout, password reset |
| `/api/sessions` | Q&A prep sessions |
| `/api/questions` | Question generation & management |
| `/api/documents` | JD/resume upload & parsing |
| `/api/companies` | Company interview styles |
| `/api/coding` | Challenges, run, submit, drafts |
| `/api/behavioral` | Behavioral questions & STAR evaluation |
| `/api/mock-interview` | Mock interview sessions & reports |
| `/api/analytics` | Dashboard, roadmap, recommendations, topic history |
| `/api/analytics/resume` | Resume upload (PDF), latest analysis, history, delete |
| `/api/config` | Public app config (e.g. Google client ID fallback) |

**Auth endpoints**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Register with email/password |
| `POST` | `/api/auth/login` | — | Login with email/password |
| `POST` | `/api/auth/google` | — | Login/register with Google ID token |
| `POST` | `/api/auth/forgot-password` | — | Request password reset email |
| `POST` | `/api/auth/reset-password/:token` | — | Set new password |
| `POST` | `/api/auth/logout` | — | Logout acknowledgment |
| `GET` | `/api/auth/me` | JWT | Current user profile |
| `GET` | `/api/auth/profile` | JWT | Current user profile (alias) |
| `PUT` | `/api/auth/profile` | JWT | Update display name |
| `POST` | `/api/auth/profile/avatar` | JWT | Upload profile image |
| `DELETE` | `/api/auth/profile/avatar` | JWT | Remove profile image |
| `POST` | `/api/auth/link-google` | JWT | Connect Google to local account |
| `GET` | `/api/config/public` | — | Public config (`googleClientId`) |

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
- [Cloudinary](https://cloudinary.com) account (recommended for profile avatars — required on Vercel)
- Google Cloud OAuth credentials (for Google sign-in)
- SMTP credentials (for password reset emails in production; optional locally — reset link logged to console)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd "Interview Prep AI"

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

**Backend (`backend/.env`)**

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `FRONTEND_URL` | Yes | Frontend origin for CORS and reset links (e.g. `http://localhost:5173`) |
| `GROQ_API_KEY` | Yes | Groq API key |
| `GOOGLE_CLIENT_ID` | For Google login | Google OAuth client ID (Web application) |
| `GOOGLE_CLIENT_SECRET` | Optional | Required only for server redirect OAuth flow |
| `GOOGLE_CALLBACK_URL` | Optional | OAuth redirect URI (e.g. `https://your-api.vercel.app/api/auth/google/callback`) |
| `CLOUDINARY_CLOUD_NAME` | Vercel / avatars | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Vercel / avatars | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Vercel / avatars | Cloudinary API secret |
| `SMTP_HOST` | Production reset | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Production reset | SMTP port (e.g. `587`) |
| `SMTP_USER` | Production reset | SMTP username |
| `SMTP_PASS` | Production reset | SMTP password or Gmail app password |
| `FROM_EMAIL` | Production reset | Sender address for transactional email |
| `SMTP_SECURE` | Optional | Set `true` for port 465 SSL |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis token |
| `AI_DAILY_LIMIT` | Optional | Max AI requests per user per day (default: `20`) |
| `MOCK_INTERVIEW_DAILY_LIMIT` | Optional | Mock interviews per day (default: `5`) |
| `MOCK_INTERVIEW_MSG_PER_MIN` | Optional | Mock interview messages per minute (default: `15`) |
| `GENERATE_AI_TEST_CASES` | Optional | `true` to enrich coding seeds with Groq-generated tests |
| `ALLOWED_ORIGINS` | Optional | Comma-separated extra CORS origins |
| `PORT` | Optional | Server port (default: `8000`) |
| `NODE_ENV` | Optional | `development` or `production` |

**Frontend (`frontend/.env`)**

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_BACKEND_URL` | Yes | Backend URL (e.g. `http://localhost:8000`) |
| `VITE_GOOGLE_CLIENT_ID` | Recommended | Same value as backend `GOOGLE_CLIENT_ID` |

> **Google client ID on Vercel:** If `VITE_GOOGLE_CLIENT_ID` is missing at build time, the frontend fetches it at runtime from `GET /api/config/public` (requires `GOOGLE_CLIENT_ID` on the backend and correct `VITE_APP_BACKEND_URL`).

Redis is optional. If Upstash vars are missing, the app runs without cache/rate limiting.

### Profile avatars (Cloudinary)

When all three `CLOUDINARY_*` variables are set, avatar uploads use **Cloudinary** on both localhost and Vercel (`interview-prep-ai/avatars/` folder).

| Environment | Cloudinary configured | Behavior |
|-------------|----------------------|----------|
| Localhost | Yes | Upload to Cloudinary → `res.cloudinary.com/...` URL |
| Localhost | No | Fallback to `backend/uploads/avatars/` (dev only) |
| Vercel production | Yes | Upload to Cloudinary |
| Vercel production | No | Returns error — local disk is not persistent on Vercel |

**Example (`backend/.env`):**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get credentials from [Cloudinary Console](https://console.cloudinary.com/) → Dashboard → **Product environment credentials**.

### Password reset (SMTP)

Forgot-password emails use Nodemailer. In **production**, all SMTP variables must be set.

| Behavior | SMTP configured |
|----------|-----------------|
| Local development | Reset link printed to **backend console** |
| Production | Email sent to user |

Reset links expire in **30 minutes**. Tokens are single-use and stored hashed (SHA-256) in MongoDB.

**Gmail:** Use an [App Password](https://myaccount.google.com/apppasswords) with 2FA enabled.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your@gmail.com
```

Google-only accounts do not receive reset emails (same generic success message is shown for security).

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
│   ├── controllers/     # Route handlers (auth, profile, password reset, AI, …)
│   ├── models/          # Mongoose schemas (User, sessions, analytics, …)
│   ├── routes/          # Express routes
│   ├── services/        # AI, Cloudinary, email, Google OAuth, password reset, …
│   ├── middlewares/     # Auth, uploads, rate limits
│   ├── constants/       # Auth provider enums
│   ├── data/            # Coding & behavioral question datasets
│   └── scripts/         # Seed & test scripts
├── frontend/
│   └── src/
│       ├── pages/       # Landing, auth, dashboard, modules, settings
│       ├── components/  # Shared UI, auth, profile
│       └── context/     # User & app config state
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Vercel |
| Database | MongoDB Atlas |
| Cache | Upstash Redis |
| Profile images | Cloudinary |
| Transactional email | SMTP (e.g. Gmail) |

### Vercel environment variables

**Backend project**

| Variable | Notes |
|----------|--------|
| `MONGO_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret |
| `FRONTEND_URL` | Production frontend URL (e.g. `https://prep-pilot-sssb.vercel.app`) |
| `GROQ_API_KEY` | Groq API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLOUDINARY_CLOUD_NAME` | Required for avatar uploads |
| `CLOUDINARY_API_KEY` | Required for avatar uploads |
| `CLOUDINARY_API_SECRET` | Required for avatar uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` | Required for password reset emails |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional |

**Frontend project**

| Variable | Notes |
|----------|--------|
| `VITE_APP_BACKEND_URL` | Production backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Same as `GOOGLE_CLIENT_ID` (optional if using `/api/config/public` fallback) |

Redeploy **both** projects after changing environment variables. Vite embeds `VITE_*` vars at build time.

### Google OAuth setup

Configure in [Google Cloud Console](https://console.cloud.google.com/):

1. Create **OAuth 2.0** credentials (Web application).
2. **Authorized JavaScript origins:**
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `https://prep-pilot-sssb.vercel.app` (your production frontend)
3. **Authorized redirect URIs** (redirect flow only):
   - `https://your-backend.vercel.app/api/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` on the backend; set `VITE_GOOGLE_CLIENT_ID` on the frontend (or rely on runtime config).

### Post-deploy checks

| Check | URL / action |
|-------|----------------|
| Backend health | `GET https://your-backend.vercel.app/health` |
| Public config | `GET https://your-backend.vercel.app/api/config/public` → should return `googleClientId` |
| Google sign-in | "Continue with Google" visible on login/signup |
| Avatar upload | Profile Settings → upload → URL starts with `res.cloudinary.com` |
| Password reset | Forgot Password → email received (or check Vercel function logs) |

> **Note:** After adding new backend routes, redeploy or restart the server. A stale process may return 404s for new endpoints.

---

## License

ISC
