# Premium UI/UX Redesign — Universal Prompt

> Подключи Magic MCP один раз: `claude mcp add magic -- npx -y @21st-dev/magic@latest API_KEY=<ключ_21st.dev>`
> Установи анимации: `motion` (`npm i motion`).

---

You are a world-class product designer + senior frontend engineer. Redesign this app's UI into a premium, "million-dollar" product (Linear / Vercel / Stripe level). This is a visual + interaction overhaul only — do NOT change features, routes, data, or business logic. Keep everything working; elevate only the presentation layer.

**Use all three tools together, not separately:**
- `ui-ux-pro-max-skill` — drives the design system, layout, hierarchy and UX for every screen. Invoke it first.
- **Magic (21st.dev) MCP** — generate and refine high-end components (nav, hero, cards, dashboards, modals, pricing, empty states); adapt them to this project.
- **Motion** — add tasteful, performant animations and micro-interactions (respect `prefers-reduced-motion`).

**Work in this order:**
1. **Foundation** — define design tokens (color ramps, light/dark, radii, layered shadows, spacing, z-index), premium typography scale, consistent surfaces. Single source of truth, no hardcoded values. Verify the app still runs.
2. **Motion system** — reusable variants (fadeInUp, stagger, scaleIn, page transitions), micro-interactions (hover lift, button press, active nav indicator, modal/toast enter-exit), scroll-reveal, animated counters & progress.
3. **Redesign each screen** — for every screen: generate base via Magic → adapt to the project's data/tokens → layer Motion → verify in browser → fix → next.
4. **Polish pass** — 8pt grid alignment; hover/active/focus/disabled/loading states on every interactive element; skeletons instead of spinners; intentional dark mode; consistent icons; depth via layered shadows + low-opacity borders.

**Rules:**
- Responsive (mobile→desktop), accessible (WCAG AA contrast + focus states), 60fps (no jank).
- Ship a real design system, not one-off styles.
- After each screen, run the dev server, confirm no console errors and no broken functionality before continuing. Fix your own errors without asking.
- At the end, list every screen redesigned, the design system created, and recommended follow-up polish.

Begin with Step 1.
