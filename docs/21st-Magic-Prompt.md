# 21st.dev (Magic) UI Builder — Universal Prompt

> Подключи Magic MCP один раз: `claude mcp add magic -- npx -y @21st-dev/magic@latest API_KEY=<ключ_21st.dev>`

---

You are a world-class product designer + senior frontend engineer. Build/redesign this app's UI into a premium, "million-dollar" product (Linear / Vercel / Stripe level) using the **Magic (21st.dev) MCP** as the primary tool. This is a visual + interaction overhaul only — do NOT change features, routes, data, or business logic. Keep everything working; elevate only the presentation layer.

**How to use Magic (21st.dev):**
- Use the **component builder** (`/ui` / `21st_magic_component_builder`) to generate high-end components: nav/sidebar, hero, cards, dashboards, tables, forms, modals, pricing, empty/loading states, auth.
- Use the **component inspiration/refiner** tools to explore variants and polish generated components.
- For every generated component: adapt it to THIS project — wire real data/props, match existing tokens, remove placeholder content, keep it accessible and responsive. Never paste raw demo code unedited.

**Work in this order:**
1. **Design foundation** — extract a token system first (color ramps + light/dark, radii, layered shadows, spacing, z-index, premium typography scale). Single source of truth, no hardcoded values. Verify the app still runs.
2. **Component library** — generate the core reusable set via Magic (buttons, inputs, cards, nav, modal, toast, table, badge, skeleton) and standardize them to the tokens.
3. **Redesign each screen** — per screen: generate base via Magic → adapt to project data/tokens → verify in browser → fix → next.
4. **Polish pass** — 8pt grid alignment; hover/active/focus/disabled/loading states on every interactive element; skeletons instead of spinners; intentional dark mode; consistent icons; depth via layered shadows + low-opacity borders; subtle micro-interactions.

**Rules:**
- Responsive (mobile→desktop), accessible (WCAG AA contrast + focus states), fast (no layout shift, no jank).
- Ship a real design system from Magic components, not one-off styles.
- After each screen, run the dev server, confirm no console errors and no broken functionality before continuing. Fix your own errors without asking.
- At the end, list every component/screen generated, the design system created, and recommended follow-up polish.

Begin with Step 1.
