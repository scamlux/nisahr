# CareerOS — Полный промпт сборки + 3D Motion Scroll дизайн (Claude CLI)

> Скопируй весь блок ниже в Claude CLI (`claude`) внутри пустой папки проекта.
> Промпт самодостаточный: стек, бизнес-логика, модель данных, API, И премиальный 3D / smooth-scroll / motion дизайн-слой.
>
> Перед запуском (один раз):
> ```bash
> # smooth scroll + scroll-анимации + 3D
> # (CLI установит сам на шаге фронтенда, но можно заранее)
> # Опционально Magic MCP для генерации премиум-компонентов:
> claude mcp add magic -- npx -y @21st-dev/magic@latest API_KEY=<ключ_21st.dev>
> ```

---

You are a senior full-stack engineer AND a world-class product designer. Build a production-grade web application called **CareerOS** — an AI Career Operating System that guides a user from "I don't know what to become" to "I got a job". Work autonomously: scaffold the repo, write all code, run it, fix errors until everything builds and the dev servers start cleanly. Ship a product that is both fully functional AND visually stunning — a premium, "million-dollar" feel (Linear / Vercel / Stripe / Arc level) with tasteful 3D, smooth scrolling, and scroll-driven motion. Ask me only if a decision truly blocks you; otherwise pick sensible defaults and keep going.

## 0. Product in one line
AI-HR consultant + personalized career roadmap + learning hub + progress tracker + interview prep, in a single platform. Target users: students, juniors, career switchers (18–35).

## 1. Tech stack (fixed — do not substitute)
- **Backend:** NestJS (TypeScript), PostgreSQL, Prisma ORM, JWT auth (access+refresh), role-based access control.
- **Frontend:** Next.js (App Router, TypeScript), TailwindCSS, shadcn/ui, TanStack Query, Zustand for client state, Recharts for analytics.
- **AI:** one `AiModule` wrapping an LLM provider via interface `LlmProvider`. Default impl = OpenAI-compatible Chat Completions reading `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` from env. Provide a `MockLlmProvider` (deterministic JSON) so the app fully works WITHOUT an API key. Select via `AI_PROVIDER=openai|mock` (default `mock`).
- **3D & Motion (design layer):**
  - `three` + `@react-three/fiber` + `@react-three/drei` — interactive 3D scenes (hero object, floating career-galaxy, animated roadmap nodes).
  - `gsap` + `ScrollTrigger` — scroll-driven timelines and pinned sections.
  - `lenis` (`@studio-freight/lenis`) — buttery smooth scroll, synced with ScrollTrigger.
  - `motion` (`motion/react`, framer-motion) — component micro-interactions, page transitions, scroll-reveal (`whileInView`).
  - Respect `prefers-reduced-motion` everywhere; provide a non-3D fallback for low-power devices / WebGL unavailable.
- **Infra:** Docker + docker-compose (postgres, backend, frontend). `.env.example` per service. Makefile with `make up`, `make seed`, `make dev`.
- **Monorepo:** pnpm workspaces — `apps/api`, `apps/web`, `packages/shared` (shared TS types & zod schemas).

## 2. Repository layout
```
careeros/
  apps/api          NestJS backend
  apps/web          Next.js frontend (with 3D + motion design system)
  packages/shared   shared types, zod DTO schemas, enums
  docker-compose.yml
  Makefile
  README.md
```

## 3. Domain model (Prisma schema — implement ALL)
- **User**: id, email (unique), passwordHash, name, role (`STUDENT|INSTRUCTOR|ADMIN`), plan (`FREE|PREMIUM`), createdAt.
- **CareerProfile** (1:1 User): interests[], goals, experienceLevel, currentSkills (json), strengths, weaknesses, preferredWorkStyle, onboardingCompleted (bool).
- **ChatSession** + **ChatMessage**: AI-HR conversations (role user|assistant, content, structuredPayload json nullable).
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

## 4. Modules & business logic (build all; MVP-critical marked ★)

### Module 1 — AI-HR Consult Chat ★
- `POST /chat/sessions`, `POST /chat/sessions/:id/messages` → calls `AiModule`.
- The career-consultant prompt returns BOTH natural text AND a structured JSON block (career recommendations / skill gaps) parsed into `structuredPayload`.
- `POST /career/profile` onboarding quiz → stores CareerProfile.
- `POST /career/recommendations` → AI generates ranked CareerRecommendation list from the profile.
- `POST /resume/review` (file upload, pdf/docx) → parse text, AI returns score + strengths + gaps + suggestions → ResumeReview.

### Module 2 — Roadmap Engine ★ (core differentiator)
- `POST /roadmaps/generate` → AI builds a personalized roadmap (stages → skills → linked LearningResources → practical tasks → milestones → estimatedWeeks) from targetRole + level + weeklyHours.
- Seed **standard** roadmaps (Frontend, Backend, Product Manager, UI/UX, Data Analyst, QA, AI Engineer) as fallback templates the AI adapts.
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
- **Plan gating:** FREE = basic chat, 1 roadmap, basic tracker. PREMIUM = unlimited roadmaps, mock interviews, deep skill analysis, insights, certificates. Enforce via `PlanGuard`.
- **Subscription:** mock upgrade/downgrade endpoints, no real payment provider.

## 5. Frontend pages (functional spec)
Auth (login/register) → Onboarding quiz → app shell with nav: **Home** (AI chat + recommendations), **Roadmap** (interactive stages, progress, edit), **Learning** (catalog, lesson player, quizzes), **Progress** (dashboard charts, streak, heatmap), **Career** (resume review upload, mock interview, job-readiness gauge), **Profile** (settings, plan, subscription). Premium-gated UI states. Responsive, dashboard-style.

---

## 6. PREMIUM 3D + MOTION + SCROLL DESIGN LAYER (build this to a flagship standard)

The app must NOT look like a generic dashboard. It must feel like a flagship 2025 product: cinematic landing, smooth scroll, scroll-driven storytelling, tasteful interactive 3D, and refined micro-interactions throughout — without harming usability or performance.

### 6.1 Design foundation (do before styling screens)
- **Design tokens** in Tailwind config + CSS variables: refined primary/accent, full neutral ramp, semantic success/warning/danger, **dark mode first** + light mode, radii, layered soft shadows, spacing scale, z-index scale. Single source of truth — no hardcoded hex.
- **Typography**: premium pairing (e.g. Geist / Inter for UI + a distinct display face for headings), fluid type scale, tight tracking on big headings, comfortable body line-height.
- **Surfaces**: glassmorphism, subtle gradients, faint grain/noise, consistent 1px low-opacity borders + inner highlights for depth.

### 6.2 Smooth scroll + scroll engine
- Wrap the app in **Lenis** smooth scroll; sync it with **GSAP ScrollTrigger** (`lenis.on('scroll', ScrollTrigger.update)` + rAF loop).
- Build a reusable scroll system: pinned sections, horizontal-scroll section, parallax layers, scroll-progress indicator, section-by-section reveal.
- Disable/relax all of this under `prefers-reduced-motion`.

### 6.3 3D scenes (React Three Fiber + drei) — tasteful, not gratuitous
- **Landing hero**: an interactive 3D centerpiece — e.g. a slowly rotating abstract "career galaxy" / orb / network of glowing nodes that reacts to cursor (parallax) and to scroll (camera dolly / rotation tied to ScrollTrigger). Use drei `<Float>`, `<Environment>`, soft lighting, bloom (postprocessing), and DPR-capped rendering.
- **Roadmap as 3D path**: render the user's roadmap stages as connected glowing nodes along a path; current stage highlighted; hover lifts a node; clicking focuses the camera. (Provide a clean 2D fallback list view too.)
- **Job-readiness**: animated 3D/Canvas gauge or radial ring that fills 0–100 on scroll into view.
- Performance rules: lazy-load 3D (`dynamic` import, `ssr:false`), suspense fallback, cap DPR (max 2), pause rendering when offscreen / tab hidden, provide static image/gradient fallback when WebGL is unavailable or on `prefers-reduced-motion`.

### 6.4 Motion system (framer-motion)
- Shared variants: `fadeInUp`, `staggerContainer`, `scaleIn`, page-transition wrapper.
- Micro-interactions: button press/hover, card hover lift, nav active indicator via `layoutId`, input focus, toast/modal enter-exit (`AnimatePresence`).
- Scroll-reveal for marketing sections (`whileInView`, `once:true`).
- Animated number counters for dashboard stats; animated progress bars/rings for roadmap & job-readiness.

### 6.5 Per-screen design direction
- **Landing**: cinematic scroll-told story — 3D hero → scroll-pinned "How CareerOS works" steps with parallax → feature showcase (cards reveal on scroll) → animated stats → testimonials → pricing → CTA. Aurora/gradient + 3D backdrop.
- **Auth / Onboarding**: premium glass cards; multi-step onboarding with animated progress and smooth step transitions; delightful completion state.
- **Home (AI assistant)**: modern chat — message bubbles, streaming typing indicator, structured recommendation cards, suggested-prompt chips.
- **Roadmap**: the 3D path view + interactive stages, progress rings, skill chips with status colors, milestone celebration moment.
- **Learning Hub**: course catalog (cover cards with hover lift), lesson player layout, quiz UI with animated feedback.
- **Progress/Analytics**: refined Recharts (custom tooltips, gradients), streak widget, skill heatmap, animated KPI counters.
- **Career**: resume upload dropzone with states, mock-interview chat, animated job-readiness gauge.
- **Profile / Pricing**: clean settings, premium Free vs Premium pricing table with highlighted plan + CTA.
- **Global**: redesigned sidebar/topnav with command-palette feel, skeleton loaders (not spinners), empty states, toasts, branded 404. Consistent everywhere.

### 6.6 (Optional) Magic MCP
If the Magic (21st.dev) MCP is connected, use its component builder to generate high-end base components (hero, nav, cards, pricing, modals, empty states), then adapt them to our tokens, data, and the 3D/motion system. Never paste raw demo code unedited.

---

## 7. Quality bar
- Shared zod DTOs validate every endpoint; class-validator on Nest side.
- Global error handling, request logging, Swagger at `/api/docs`.
- Seed script: 1 admin, 1 instructor, 2 students (one FREE one PREMIUM), 7 standard roadmaps, sample courses with lessons+quizzes, curated learning resources, sample progress events so dashboards render with real data.
- Tests: unit tests for roadmap completion %, streak calc, plan gating, job-readiness scoring; e2e smoke test for auth + roadmap generation (using MockLlmProvider).
- **Design/perf bar:** responsive (mobile→desktop), accessible (WCAG AA contrast + visible focus states, `prefers-reduced-motion` honored), 60fps (no jank, no layout shift), 3D lazy-loaded with fallbacks. Lighthouse: keep performance reasonable despite 3D (code-split, DPR cap, offscreen pause).
- Everything must run with: `cp .env.example .env` (each app) → `docker-compose up` → migrate → seed → both servers live. Document exact commands in README.

## 8. Build order (do in sequence, verify each before moving on)
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
11. **Frontend foundation:** design tokens + typography + Lenis smooth scroll + GSAP/ScrollTrigger setup + motion variants + R3F base scene wrapper with fallbacks. Verify app runs.
12. **Build all functional screens** wired to the API.
13. **Layer the premium design**: landing cinematic scroll story + 3D hero, 3D roadmap path, animated gauges/counters, per-screen motion & polish.
14. Tests, Swagger, README, final `docker-compose up` verification.

## 9. Rules
- Prioritize ★ MVP modules first; the app must be usable end-to-end after step 12 even if visual polish (step 13) continues after.
- The app MUST work with zero AI credentials via MockLlmProvider — never hard-fail on a missing API key.
- The app MUST work with WebGL disabled / reduced-motion — never hard-fail the UI; always provide a graceful 2D fallback.
- After each major step, run the build/tests and fix all errors before continuing. Don't ask permission to fix your own errors.
- Keep secrets in env only. No real payment integration. Web only (no mobile app).
- Keep 3D/motion tasteful and performant — elevate perceived quality, never block usability or tank performance.
- When finished, print a short summary: how to run, default seeded logins, the design system + 3D/motion features built, and which optional features (LinkedIn, GitHub analysis, voice interview, verified certificates) were intentionally left as future work.

Begin now with step 1.
