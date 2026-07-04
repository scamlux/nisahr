# CareerOS — AI Career Operating System

From _“I don’t know what to become”_ to _“I got the job.”_
An AI-HR consultant, personalized career roadmaps, a learning hub, progress tracking and
interview prep — in one premium platform.

Built as a pnpm monorepo: **NestJS + Prisma + PostgreSQL** backend, **Next.js (App Router) +
Tailwind + Three.js/R3F + GSAP + Lenis + Framer Motion** frontend, with a fully working
**Mock AI provider** so the whole app runs with **zero API credentials**.

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

- **Auth & RBAC** — JWT access + refresh, `passport-jwt`, `@Roles()` + `RolesGuard`,
  `@RequirePlan(PREMIUM)` + `PlanGuard` for plan gating.
- **AiModule** — wraps an `LlmProvider` interface. `AI_PROVIDER=mock|openai`:
  - `MockLlmProvider` — deterministic, no credentials needed (default).
  - `OpenAiLlmProvider` — OpenAI-compatible Chat Completions (`OPENAI_API_KEY/BASE_URL/MODEL`).
  - Domain logic (recommendations, roadmap generation, resume scoring, interview eval, insights)
    is template-driven so it always works and degrades gracefully if a live LLM call fails.
- **Modules** — AI-HR chat (structured payloads), career profile + recommendations + skill gaps,
  resume review (file upload), roadmap engine (generate/edit/complete + completion %),
  learning hub (courses, lessons, quizzes, enrollment, certificates), progress & analytics
  (streaks, hours, heatmap, AI insights), mock interviews, job-readiness scoring, mock subscription.
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

## Notes on this build environment

The app was verified end-to-end locally (auth → roadmap generation → chat → analytics →
plan-gating 403s, plus the rendered landing/login/home/roadmap UI and the live 3D scenes).
Because the Docker daemon was not running in the build sandbox, verification used a native
PostgreSQL instance; the committed `docker-compose.yml` + Dockerfiles are the documented,
intended run path.

---

## Intentionally left as future work

- Real payment gateway (billing is mocked by design).
- LinkedIn / GitHub profile analysis for auto-skill detection.
- Voice-based mock interviews (speech-to-text).
- Cryptographically verifiable certificates (current certs are issued + serialized in-app).
- PDF/DOCX deep parsing (resume text extraction is best-effort without native parser deps).
- Real-time token streaming for chat (responses are returned per-message today).
```
