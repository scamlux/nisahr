# CareerOS — AI Career Operating System

From _“I don’t know what to become”_ to _“I got the job.”_
An AI-HR consultant, personalized career roadmaps, a learning hub, progress tracking and
interview prep — in one platform.

Built as a pnpm monorepo: **NestJS + Prisma + PostgreSQL** backend, **Next.js (App Router) +
Tailwind + Three.js/R3F + GSAP + Lenis + Framer Motion** frontend, **free-first** and
**zero-key** — every feature runs with mock providers and **no API credentials**.

## PRD v3 features

1. **Psychological test → recommendations (F1)** — a deterministic RIASEC (Holland Codes)
   assessment; arithmetic scoring maps you to matching professions (no LLM needed).
2. **Ready-made roadmap catalog (F2)** — pick a curated path (frontend, backend, data, AI, UX, QA).
3. **AI-HR chat with web-search tools (F3)** — an intent router fires `searchJobs`,
   `searchResources` and `getInterviewPrep`, returning live job/resource cards. Works zero-key
   via a mock search provider; Tavily/Brave/SearXNG activate with keys.
4. **Roadmap as a roadmap.sh-style flowchart (F4)** — an interactive React Flow graph with
   typed resources per node (free videos, docs, practice) and mark-as-learned progress.
5. **Profile hub (F5)** — one aggregated view of identity, RIASEC code, roadmaps, certificates and activity.
6. **Final assessment + verifiable certificate (F6)** — a timed, anti-cheat MCQ exam;
   passing issues a certificate with a **crypto-random verify token** and a QR code that resolves
   to a **public, PII-free `/verify/:token`** page (print-to-PDF).
7. **Google sign-in + email verification (F7)** — real OAuth2 when configured, a safe zero-key
   mock otherwise (auto-disabled when real credentials are present).

Plus: a **multi-model AI registry** (OpenAI / Gemini / Groq / OpenRouter / Mock) with a
per-request model switcher, and **UZ / RU / EN** i18n across every screen.

---

## Quick start

### Option A — Docker (one command)

```bash
cp .env.example .env            # optional: tweak secrets / AI provider
docker compose up --build       # postgres + api + web; api auto-migrates & seeds
```

- Web:  http://localhost:3000
- API:  http://localhost:4000/api
- Swagger: http://localhost:4000/api/docs

### Option B — Local dev (pnpm)

Requires Node ≥ 20, pnpm 9, and a PostgreSQL instance.

```bash
pnpm install

# 1) Backend
cd apps/api
cp .env.example .env            # set DATABASE_URL to your Postgres
pnpm prisma:generate
pnpm prisma migrate dev --name init
pnpm prisma:seed
pnpm dev                        # API on :4000

# 2) Frontend (new terminal)
cd apps/web
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:4000/api
pnpm dev                        # Web on :3000
```

The shared package must be built before the apps in a fresh checkout:
`pnpm --filter @careeros/shared build` (the `make dev` / Docker flows do this for you).

### Makefile shortcuts

```bash
make up        # docker compose up --build
make seed      # reseed the DB in the running api container
make dev       # run api + web locally
make test      # run backend unit tests
```

---

## Seeded logins

All passwords: **`password123`**

| Email                     | Role       | Plan    | Notes                                   |
| ------------------------- | ---------- | ------- | --------------------------------------- |
| `admin@careeros.dev`      | ADMIN      | PREMIUM | Owns the 7 standard roadmap templates   |
| `instructor@careeros.dev` | INSTRUCTOR | PREMIUM | Teaches the seeded courses              |
| `student@careeros.dev`    | STUDENT    | FREE    | Frontend roadmap, 30% done, FREE gating |
| `premium@careeros.dev`    | STUDENT    | PREMIUM | AI roadmap 50% done, streak, full data  |

Tip: log in as `premium@careeros.dev` to see populated dashboards, then as
`student@careeros.dev` to see FREE-plan gating and upgrade flows.

---

## Architecture

```
careeros/
  apps/api          NestJS — auth, AI, roadmap, chat, learning, progress, interview, subscription
  apps/web          Next.js — landing + app, design system, 3D + motion
  packages/shared   Shared TS types, zod DTO schemas, enums (single source of truth)
  docker-compose.yml / Makefile / README.md
```

### Backend (NestJS + Prisma)

- **Auth & RBAC** — JWT access + refresh, `passport-jwt`, `@Roles()` + `RolesGuard`.
  Google OAuth2 + email verification (F7); `PlanGuard` is a no-op while billing is disabled.
- **AiModule** — a provider **registry** behind an `LlmProvider` interface, selected by
  `AI_PROVIDER` and overridable per request via the UI model switcher:
  - `MockLlmProvider` — deterministic, no credentials (default).
  - OpenAI / Groq / OpenRouter (OpenAI-compatible) + Gemini (native) — activate with their keys.
  - Domain logic (recommendations, roadmap generation, resume scoring, interview eval, insights)
    is template-driven so it always works and degrades gracefully if a live LLM call fails.
- **SearchModule (F3)** — a search-provider registry mirroring the AI one (`SEARCH_PROVIDER`):
  mock (default) + Tavily / Brave / SearXNG. Powers the AI-HR tools with a `JobSearchCache`.
- **Modules** — AI-HR chat (intent router + job/resource cards), psych test (F1, RIASEC),
  career profile + recommendations + skill gaps, roadmap engine + roadmap.sh graph (F4),
  final assessment + verifiable certificate (F6) with a public `/verify/:token`, profile hub (F5),
  resume review, learning hub, progress & analytics, mock interviews, job-readiness, mock subscription.
- **Quality** — global exception filter, request-logging interceptor, zod + class-validator,
  Swagger at `/api/docs`, unit tests for roadmap completion %, streak calc, plan gating and
  job-readiness scoring.

### Frontend (Next.js App Router)

- **Design system** — dark-first tokens via CSS variables (single source of truth), premium
  type pairing (Space Grotesk display + Inter UI), glassmorphism, aurora gradients, grain,
  layered shadows, skeleton loaders, toasts, branded 404.
- **Motion & scroll** — Lenis smooth scroll synced to GSAP ScrollTrigger, Framer Motion
  variants (`fadeInUp`, `stagger`, `scaleIn`, page transitions), scroll-reveal, animated number
  counters, animated progress rings/bars, `layoutId` nav indicator.
- **3D (React Three Fiber + drei)** — interactive “career galaxy” hero orb (cursor parallax,
  Float, additive node cloud, stars) and a 3D roadmap path (glowing node-per-stage with
  done/active/upcoming states, hover labels).
- **Resilience** — all 3D is `dynamic(ssr:false)` + Suspense, DPR-capped (max 2), and falls back
  to static gradients / 2D views when **WebGL is unavailable** or **prefers-reduced-motion** is set.
- **Screens** — cinematic landing, auth, multi-step onboarding quiz, AI chat home,
  interactive roadmap, learning hub + lesson player + quizzes, analytics (Recharts),
  career prep (resume / interview / job-readiness), profile + pricing.

---

## Plan gating (FREE vs PREMIUM)

- **FREE** — basic AI chat, **1 roadmap**, learning hub, basic tracker.
- **PREMIUM** — unlimited roadmaps, mock interviews, deep skill-gap analysis, AI insights,
  resume review + job-readiness, certificates.

Enforced server-side via `PlanGuard` (returns `403 UPGRADE_REQUIRED`). The mock subscription
endpoints (`/subscription/change`) flip the plan with no real payment provider; the frontend
refreshes the JWT so the new plan takes effect immediately.

---

## Tests

```bash
pnpm --filter @careeros/api test
```

Covers: roadmap stage/overall completion, learning streak (consecutive-day) calculation,
plan-gating guard behavior, and weighted job-readiness scoring.

---

## Deployment

Production runs on **Vercel + Supabase** (Render is no longer used):

| Component | Host | Notes |
| --- | --- | --- |
| Web (Next.js) | **Vercel** — project `nisahr-web`, root `apps/web` | auto-deploy on push, PR previews |
| API (NestJS) | **Vercel** — project `nisahr-api`, root `apps/api` | serverless via `apps/api/api/index.ts` + `vercel.json`; Fluid Compute keeps it warm |
| Database | **Supabase** Postgres (eu-central-1) | pooler (`:6543`) for runtime `DATABASE_URL`, direct (`:5432`) for `DIRECT_URL` / migrations |

The NestJS app is served as a single serverless function: all requests are rewritten
to `apps/api/api/index.ts`, which forwards them into a cached Nest/Express instance
(`src/app.factory.ts`) so only cold requests pay the bootstrap cost. Migrations run via
`prisma migrate deploy` (build or manual step), never at request time.

**Full setup + cutover runbook:** [`docs/DEPLOY_VERCEL.md`](docs/DEPLOY_VERCEL.md).

---

## Notes on this build environment

The app was verified end-to-end locally (auth → roadmap generation → chat → analytics →
plan-gating 403s, plus the rendered landing/login/home/roadmap UI and the live 3D scenes).
Because the Docker daemon was not running in the build sandbox, verification used a native
PostgreSQL instance; the committed `docker-compose.yml` + Dockerfiles are the documented,
intended run path.

---

## Free-first & zero-key configuration

Everything runs with no credentials. Providers upgrade in place when keys are supplied:

| Variable | Default | Effect |
| --- | --- | --- |
| `AI_PROVIDER` | `mock` | LLM provider (`mock` \| `openai` \| `gemini` \| `groq` \| `openrouter`) |
| `SEARCH_PROVIDER` | `mock` | Web search (`mock` \| `tavily` \| `brave` \| `searxng`) |
| `BILLING_ENABLED` | `false` | Premium gates + `PlanGuard` are off; all features free |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | _unset_ | Enables real Google OAuth2 |
| `AUTH_DEV_BYPASS` | `false` | The zero-key mock Google login (auto-on when Google is unconfigured, **forced off** when it is — unless set `true`) |
| `MAIL_ENABLED` | `false` | When off, registrations auto-verify email so login is never blocked |

Provider/search keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`,
`TAVILY_API_KEY`, `BRAVE_API_KEY`, `SEARXNG_URL`) are all optional.

## Intentionally left as future work

- Real payment gateway (billing is mocked by design).
- LinkedIn / GitHub profile analysis for auto-skill detection.
- Voice-based mock interviews (speech-to-text).
- PDF/DOCX deep parsing (resume text extraction is best-effort without native parser deps).
- True server-side token streaming (chat currently streams client-side; the mock returns full text).
```
