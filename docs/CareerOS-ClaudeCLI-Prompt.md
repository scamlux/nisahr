# CareerOS — Build Prompt for Claude CLI

> Скопируй весь блок ниже и вставь в Claude CLI (`claude`) внутри пустой папки проекта.
> Промпт самодостаточный: содержит стек, архитектуру, модель данных, API, бизнес-логику и порядок сборки.

---

You are a senior full-stack engineer. Build a production-grade web application called **CareerOS** — an AI Career Operating System that guides a user from "I don't know what to become" to "I got a job". Work autonomously: scaffold the repo, write all code, run it, fix errors until everything builds and the dev servers start cleanly. Ask me only if a decision blocks you; otherwise pick sensible defaults and keep going.

## 0. Product in one line
AI-HR consultant + personalized career roadmap + learning hub + progress tracker + interview prep, in a single platform. Target users: students, juniors, career switchers (18–35).

## 1. Tech stack (fixed — do not substitute)
- **Backend:** NestJS (TypeScript), PostgreSQL, Prisma ORM, JWT auth, role-based access control.
- **Frontend:** Next.js (App Router, TypeScript), TailwindCSS, shadcn/ui, TanStack Query, Zustand for client state, Recharts for analytics.
- **AI:** one `AiModule` wrapping an LLM provider via an interface `LlmProvider`. Default implementation = OpenAI-compatible Chat Completions reading `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` from env. Provide a `MockLlmProvider` (deterministic JSON) so the app fully works WITHOUT an API key. Select provider by env flag `AI_PROVIDER=openai|mock` (default `mock`).
- **Infra:** Docker + docker-compose (postgres, backend, frontend). `.env.example` for every service. Makefile with `make up`, `make seed`, `make dev`.
- **Monorepo:** pnpm workspaces — `apps/api`, `apps/web`, `packages/shared` (shared TS types & zod schemas).

## 2. Repository layout
```
careeros/
  apps/api        NestJS backend
  apps/web        Next.js frontend
  packages/shared shared types, zod DTO schemas, enums
  docker-compose.yml
  Makefile
  README.md
```

## 3. Domain model (Prisma schema — implement all)
- **User**: id, email (unique), passwordHash, name, role (`STUDENT|INSTRUCTOR|ADMIN`), plan (`FREE|PREMIUM`), createdAt.
- **CareerProfile** (1:1 User): interests[], goals, experienceLevel, currentSkills (json), strengths, weaknesses, preferredWorkStyle, onboardingCompleted (bool).
- **ChatSession** + **ChatMessage**: AI-HR conversations (role: user|assistant, content, structuredPayload json nullable).
- **CareerRecommendation**: userId, title, reason, entryDifficulty, estimatedMonths, score.
- **Roadmap**: userId, targetRole, level, weeklyHours, status, estimatedWeeks, isAiGenerated.
- **RoadmapStage** (n per Roadmap): order, title, description, status, milestone (bool).
- **Skill** + **RoadmapStageSkill** (m:n): skill name, category, status (`NOT_STARTED|IN_PROGRESS|DONE`).
- **LearningResource**: title, type (`VIDEO|ARTICLE|YOUTUBE|COURSERA|UDEMY|INTERNAL`), url, provider, durationMin, linked to skill/stage.
- **PracticalTask**: stageId, title, description, isAutoChecked, completed.
- **Course** (internal LMS): instructorId, title, description, price, published. **Lesson** (video url, order), **Quiz** + **QuizQuestion** (json options, correctIndex), **Enrollment** (userId, courseId, progressPct), **Certificate**.
- **ProgressEvent**: userId, type (`LESSON_DONE|SKILL_DONE|TASK_DONE|STAGE_DONE`), refId, hoursSpent, createdAt — source of truth for analytics & streaks.
- **ResumeReview**: userId, fileUrl, parsedText, score, strengths[], gaps[], suggestions[].
- **MockInterview**: userId, type (`HR|TECHNICAL|BEHAVIORAL`), transcript json, feedback, score.
- **JobReadiness**: userId, targetRole, score (0–100), breakdown json.
- **Subscription**: userId, plan, status, startedAt (mock billing — no real payment gateway, just upgrade/downgrade endpoints).

## 4. Modules & business logic (build all; MVP-critical ones marked ★)

### Module 1 — AI-HR Consult Chat ★
- `POST /chat/sessions`, `POST /chat/sessions/:id/messages` → calls `AiModule`.
- The career-consultant prompt must return BOTH natural text AND a structured JSON block (career recommendations / skill gaps) parsed into `structuredPayload`.
- `POST /career/profile` onboarding quiz → stores CareerProfile.
- `POST /career/recommendations` → AI generates ranked CareerRecommendation list from the profile.
- `POST /resume/review` (file upload, pdf/docx) → parse text, AI returns score + strengths + gaps + suggestions → ResumeReview.

### Module 2 — Roadmap Engine ★ (core differentiator)
- `POST /roadmaps/generate` → AI builds a personalized roadmap (stages → skills → linked LearningResources → practical tasks → milestones → estimatedWeeks) from targetRole + level + weeklyHours.
- Seed **standard** roadmaps (Frontend, Backend, Product Manager, UI/UX, Data Analyst, QA, AI Engineer) as fallback templates the AI can adapt.
- CRUD: save, edit, mark stage/skill/task done, add custom task. Recompute completion % on every change.
- Skill-gap analysis: compare CareerProfile.currentSkills vs roadmap skills → gap list.

### Module 3 — Learning Hub ★
- `GET /learning/resources?skillId=` curated resources per skill.
- Internal LMS: course catalog, lessons (video), quizzes with auto-grading, assignments, enrollment, progress, certificate issuance on completion.
- Mark lesson/course complete → emits ProgressEvent.

### Module 4 — Progress & Analytics ★
- `GET /progress/dashboard` → roadmap completion %, learning streak (consecutive active days from ProgressEvent), weekly & monthly hours, skill heatmap, completed skills/courses count.
- `GET /progress/insights` → AI learning insights (productivity, pace, growth zones, motivation-risk) + weekly summary.

### Module 5 — Career Preparation
- `POST /interview/mock` → AI runs HR/technical/behavioral interview turn-by-turn, returns questions, evaluates answers, gives feedback + score.
- `GET /career/job-readiness?role=` → JobReadiness score 0–100 with breakdown (skills coverage, roadmap %, resume score, interview score).

### Cross-cutting
- **Auth:** register/login (JWT access+refresh), RBAC guard (`@Roles`), `STUDENT|INSTRUCTOR|ADMIN`.
- **Plan gating:** FREE = basic chat, 1 roadmap, basic tracker. PREMIUM = unlimited roadmaps, mock interviews, deep skill analysis, insights, certificates. Enforce with a `PlanGuard`.
- **Subscription:** mock upgrade/downgrade endpoints, no real payment provider.

## 5. Frontend (Next.js) — pages
Auth (login/register) → Onboarding quiz → app shell with nav: **Home** (AI chat assistant + recommendations), **Roadmap** (interactive stages, progress bars, edit), **Learning** (catalog, lesson player, quizzes), **Progress** (dashboard charts, streak, heatmap), **Career** (resume review upload, mock interview, job-readiness gauge), **Profile** (settings, plan, subscription). Premium-gated UI states. Responsive, clean, dashboard-style.

## 6. Quality bar
- Shared zod DTOs validate every endpoint; class-validator on Nest side.
- Global error handling, request logging, Swagger at `/api/docs`.
- Seed script: 1 admin, 1 instructor, 2 students (one FREE one PREMIUM), 7 standard roadmaps, sample courses with lessons+quizzes, curated learning resources, sample progress events so dashboards render with real data.
- Tests: at least unit tests for roadmap completion %, streak calc, plan gating, job-readiness scoring; e2e smoke test for auth + roadmap generation (using MockLlmProvider).
- Everything must run with: `cp .env.example .env` (each app) → `docker-compose up` → migrate → seed → both servers live. Document exact commands in README.

## 7. Build order (do in this sequence, verify each before moving on)
1. Monorepo + docker-compose + Postgres + Prisma schema + migration.
2. `packages/shared` types/zod + enums.
3. Auth + RBAC + User/CareerProfile + seed.
4. AiModule with MockLlmProvider + OpenAI provider behind the interface.
5. Module 2 Roadmap Engine (★ core) + standard roadmap seeds.
6. Module 1 AI-HR chat + recommendations + resume review.
7. Module 3 Learning Hub + internal LMS.
8. Module 4 Progress & Analytics.
9. Module 5 Interview + Job Readiness.
10. Plan gating + subscription.
11. Next.js frontend for all modules.
12. Tests, Swagger, README, final `docker-compose up` verification.

## 8. Rules
- Prioritize the ★ MVP modules first; the app must be usable end-to-end after step 11 even if later polish remains.
- The app MUST work with zero AI credentials via MockLlmProvider — never hard-fail on a missing API key.
- After each major step, run the build/tests and fix all errors before continuing. Don't ask permission to fix your own errors.
- Keep secrets in env only. No real payment integration. No mobile app — web only.
- When finished, print a short summary: how to run, default seeded logins, and which optional features (LinkedIn, GitHub analysis, voice interview, verified certificates) were intentionally left as future work per the PRD.

Begin now with step 1.
