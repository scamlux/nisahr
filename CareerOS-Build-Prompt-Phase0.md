# CareerOS — Build Prompt for Claude CLI (Phase 0 + Walking Skeleton)

> Открой пустую папку проекта, запусти `claude` и вставь весь блок ниже.
> Полная спецификация продукта — в `CareerOS-SPEC-and-Plan.md` (держи её рядом; при желании положи в репозиторий и сошлись на неё).

---

You are a founding senior full-stack engineer. Build the **foundation + walking skeleton** of **CareerOS** — a free AI career platform. Work autonomously: scaffold, code, run, and fix errors until everything builds and both dev servers start cleanly. Fix your own errors without asking. Ask me only if a decision truly blocks you.

## Goal of this phase
A working end-to-end slice a user can click through:
**Register/Login → Psychological test → Profession recommendations → Pick a specialty + learning params → Generated interactive roadmap rendered 1:1 like roadmap.sh (flowchart canvas) with a side drawer of resources per node.**
Everything must run with **zero paid services and zero API keys** via mock providers.

## Non-negotiable principles
- **Free-first.** No monetization, no billing, no Free/Premium gating. Every external service behind an interface with a **mock implementation** so the app fully works offline: `LlmProvider`, `SearchProvider`, `StorageProvider`, `EmailProvider`.
- **Provider registry with model switcher.** `LlmProvider` supports multiple models (OpenAI, Gemini, Groq, OpenRouter, Mock) selectable via env `AI_PROVIDER`/`AI_MODEL` AND via a UI switcher. Default = `mock`.
- **i18n from day one:** UZ / RU / EN via next-intl, language switcher in the header. All UI strings translated.
- **Premium look.** Clean, modern, animated (Framer Motion), design tokens (no hardcoded colors), light/dark, responsive, WCAG AA. Reference quality: Linear / Vercel / roadmap.sh.

## Tech stack (fixed)
- Monorepo: pnpm workspaces — `apps/api`, `apps/web`, `packages/shared`.
- Backend: NestJS (TS) + PostgreSQL + Prisma + JWT + Google OAuth (behind mock in dev). Swagger at `/api/docs`.
- Frontend: Next.js (App Router, TS) + TailwindCSS + shadcn/ui + **React Flow** (roadmap flowchart) + TanStack Query + Zustand + Framer Motion + next-intl.
- Infra: Docker Compose (postgres, api, web), Makefile (`make up`, `make dev`, `make seed`), `.env.example` per app.

## Build steps (do in order, verify each before moving on)

### Step 1 — Monorepo, Docker, DB
pnpm workspaces + shared TS config, ESLint/Prettier, Husky. docker-compose (postgres:16, api, web) + Makefile + `.env.example`. NestJS bootstrap: ConfigModule with env validation, global ValidationPipe, exception filter, request-id logging, CORS, `/health`, Swagger.
**Verify:** `make up` runs; `/health`=200; Swagger loads.

### Step 2 — Prisma schema (skeleton entities)
Implement these tables now: `User`, `PsychTest`, `PsychTestResult`, `CareerRecommendation`, `Roadmap`, `RoadmapNode`, `NodeEdge`, `NodeResource`, `ProgressEvent`, `Profile/Settings`. Enums: Role, SkillStatus/NodeStatus, ResourceType(`FREE_VIDEO|OFFICIAL_DOC|POPULAR|PAID_COURSE|ARTICLE`), NodeType(`topic|subtopic|optional`), EdgeType(`required|optional`), Lang(`uz|ru|en`). Indexes: `ProgressEvent(userId,createdAt)`, `RoadmapNode(roadmapId,order)`. Run first migration.
**Verify:** `prisma migrate dev` ok; Prisma Studio shows all tables.

### Step 3 — packages/shared
All enums + zod DTO schemas (auth, psych-test, recommendations, roadmap generate/read, node resources) + inferred TS types. Consumed by both api and web (single source of truth).

### Step 4 — Providers (all with Mock default)
- `LlmProvider` interface + registry: `MockLlmProvider` (deterministic JSON), plus stubs for OpenAI/Gemini/Groq/OpenRouter reading env keys. Structured-output layer: validate LLM JSON with zod, 1 repair-retry, fallback.
- `SearchProvider` interface + `MockSearchProvider` (returns realistic sample resources/jobs), stubs for Tavily/Brave.
- `StorageProvider` (LocalDisk) and `EmailProvider` (console/log in dev).
**Verify:** with `AI_PROVIDER=mock` all AI/search calls return valid data, no keys needed.

### Step 5 — Auth (F7)
`POST /auth/register`, `POST /auth/login` (email+password, Argon2), `POST /auth/refresh`, `GET /auth/me`, Google OAuth route (works via mock/dev bypass when no client id). JWT access(15m)+refresh(7d). Email verification via EmailProvider (dev = console).
**Verify:** register→login→/me works; e2e smoke green.

### Step 6 — Psychological test → recommendations (F1)
- `GET /psych-test` returns a versioned RIASEC/Big-Five-lite question set (~20 questions, i18n).
- `POST /psych-test/submit` → **deterministic scoring** (NOT the LLM) → axes + profile stored in `PsychTestResult`.
- `POST /career/recommendations` → deterministic axis→profession mapping + LLM-enriched explanations → `CareerRecommendation[]` (title, matchScore %, reason, entryDifficulty, estimatedMonths).
**Verify:** identical answers → identical profile; returns 3–7 professions with % and reason. Unit-test the scorer.

### Step 7 — Roadmap catalog + generation (F2 + F4 core)
- Seed **3 ready-made roadmaps** with pre-laid-out flowchart coordinates: **Frontend, Backend, UI/UX** (nodes with x/y, edges required/optional, groups, and 2–4 `NodeResource` per key node across categories, in uz/ru/en).
- `GET /roadmaps/catalog`, `POST /roadmaps/select` (from recommendation OR catalog → user copy).
- `POST /roadmaps/generate` (specialty + learning params: level, hours/week, duration) → hybrid: seed graph + Mock/LLM adaptation of scope + resources via SearchProvider. Store layout in DB.
- `PATCH` node status → recompute completion % → emit `ProgressEvent`.
**Verify:** generating Backend @ junior/10h returns a valid graph with laid-out nodes and live-looking resources; completion % updates on node changes.

### Step 8 — Frontend walking skeleton
App shell (App Router) + typed API client from `shared` + TanStack Query + Zustand session + protected routes + 401/refresh handling. Header with **language switcher (uz/ru/en)** and **AI-model switcher**. Screens:
1. Landing (premium hero, animated).
2. Auth (email + Google button).
3. Psych test (multi-step, animated progress, smooth transitions).
4. Recommendations (profession cards with match % and reason; "choose this" or "browse catalog").
5. Roadmap catalog + learning-params form.
6. **Roadmap flowchart** — React Flow canvas 1:1 like roadmap.sh: nodes/edges, zoom/pan, minimap, node status colors, dashed optional edges. **Click a node → side drawer** with tabs: Videos / Resources / Docs / Practice, grouped by category, with "mark as learned".
All with design tokens, Framer Motion, light/dark, responsive.
**Verify in browser:** full flow register → test → recommendations → select specialty → see interactive flowchart → open node drawer → mark node done → progress updates. No console errors.

### Step 9 — Seed + docs + smoke
Idempotent seed (1 admin, 2 users, 3 roadmaps with nodes/edges/resources, sample psych test, demo progress). README with exact run commands and default logins. Unit tests: psych scorer, completion %. E2e smoke: auth + roadmap generation (mock providers). `make up && make seed` → both servers live.

## Final output
Print: how to run, seeded logins, which providers are active (all mock by default), and a short list of what belongs to later phases (AI-HR chat with real web search, final test + certificate, remaining roadmaps, full profile). Keep everything working after Step 8 even if polish remains.

Begin with Step 1 now.
