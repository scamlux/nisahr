# CareerOS — Premium UI/UX Redesign Prompt (Claude CLI)

> Скопируй блок ниже в Claude CLI внутри папки проекта CareerOS.
> Перед запуском подключи Magic MCP (один раз):
> ```bash
> claude mcp add magic -- npx -y @21st-dev/magic@latest API_KEY=<твой_ключ_с_21st.dev>
> ```
> И установи библиотеку анимаций в `apps/web`:
> ```bash
> pnpm --filter web add motion
> ```

---

You are a world-class product designer + senior frontend engineer. Your mission: take the **current plain CareerOS web app** and redesign it into a **premium, "looks-like-a-million-dollar-product" UI** — the level of Linear, Vercel, Stripe, Arc. This is a visual + interaction overhaul, NOT a feature change. Do not break existing functionality, routes, data flow, or API calls. Only elevate the presentation layer.

## Tools you MUST use (combine them, don't pick one)
1. **`ui-ux-pro-max-skill`** — invoke this skill first to drive the design system, layout, hierarchy, and UX decisions for every screen. Treat its output as the design direction.
2. **Magic (21st.dev) MCP** — use the `/ui` (21st_magic_component_builder) and component-refiner tools to generate and polish high-end React components (hero sections, nav, cards, dashboards, pricing, modals, empty states). Adapt generated components to our Tailwind + shadcn/ui setup and our data.
3. **Motion** (`motion/react`) — add tasteful, performant animations and micro-interactions everywhere it improves perceived quality.

## Hard constraints
- Stack stays: Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui. Do not introduce a different UI framework.
- Keep all existing pages, props, API endpoints, and business logic working. Refactor markup/styles, not the data layer.
- Everything must stay responsive (mobile → desktop), accessible (WCAG AA: contrast, focus states, reduced-motion support via `prefers-reduced-motion`), and fast (no janky animations, 60fps, `will-change` used sparingly).
- Ship a real **design system**, not one-off styles.

## Step 1 — Design foundation (do before touching pages)
Use `ui-ux-pro-max-skill` to define and implement:
- **Design tokens** in Tailwind config + CSS variables: color palette (refined primary/accent, neutral ramp, semantic success/warning/danger), dark mode + light mode, radii, shadows (layered, soft), spacing scale, z-index scale.
- **Typography system**: a premium pairing (e.g. Geist / Inter for UI + a distinct display face for headings), fluid type scale, tight tracking on headings, comfortable line-height on body.
- **Elevation & surfaces**: glassmorphism / subtle gradients / grain where appropriate, consistent border + shadow language.
- A `theme.ts` / tokens file as the single source of truth; refactor existing components to consume tokens (no hardcoded hex).

## Step 2 — Motion system
Create a small reusable animation layer with `motion/react`:
- Shared variants: `fadeInUp`, `staggerContainer`, `scaleIn`, page-transition wrapper.
- Micro-interactions: button press/hover, card hover lift, nav active indicator (layoutId), input focus, toast/modal enter-exit (AnimatePresence).
- Scroll-reveal for landing/marketing sections (`whileInView`, once: true).
- Animated number counters for dashboard stats, animated progress bars/rings for roadmap & job-readiness.
- Respect `prefers-reduced-motion` — disable non-essential motion.

## Step 3 — Redesign every surface (use Magic to generate, then refine)
Apply the new system + motion to each screen:
- **Landing / Auth**: bold hero with animated gradient/aurora background, value props, social proof, premium login/register cards.
- **Onboarding quiz**: multi-step with animated progress, smooth step transitions, delightful completion state.
- **Home (AI Assistant)**: modern chat UI — message bubbles, streaming typing indicator, structured recommendation cards, suggested-prompt chips.
- **Roadmap**: visually rich interactive timeline/stages, progress rings, skill chips with status colors, hover/expand animations, milestone celebration moment.
- **Learning Hub**: polished course catalog (cards with cover, hover lift), lesson player layout, quiz UI with animated feedback.
- **Progress/Analytics**: dashboard with refined Recharts (custom tooltips, gradients), streak widget, skill heatmap, animated KPI counters.
- **Career**: resume upload dropzone with states, mock-interview chat, animated job-readiness gauge (0–100).
- **Profile / Pricing**: clean settings, premium Free vs Premium pricing table with highlighted plan and CTA.
- **Global**: redesigned sidebar/topnav, command-palette feel, skeleton loaders, empty states, toasts, 404. Consistent across all.

## Step 4 — Polish pass (the "million-dollar" details)
- Pixel-consistent spacing & alignment on an 8pt grid.
- Hover/active/focus/disabled/loading states for EVERY interactive element.
- Optimistic UI + skeletons instead of spinners.
- Subtle depth: layered shadows, 1px borders with low-opacity, inner highlights.
- Dark mode that looks intentional, not inverted.
- Consistent iconography (lucide-react).

## Workflow rules
1. First invoke `ui-ux-pro-max-skill` and produce the design direction + tokens. Implement the foundation and verify the app still runs (`pnpm --filter web dev`).
2. Then redesign screens one by one. For each: generate base components via Magic MCP, adapt them to our data/tokens, layer in Motion, verify in the browser, fix, move on.
3. After each screen, run the dev server and confirm no console errors and no broken functionality before continuing. Don't ask permission to fix your own errors.
4. Take screenshots / describe each redesigned screen as you go.
5. At the end: list every screen you redesigned, the tokens/system you created, and any follow-up polish you recommend.

Begin with Step 1 now.
