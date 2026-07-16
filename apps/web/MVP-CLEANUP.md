# MVP Cleanup — delivery notes

CareerOS was simplified back to a lean, single-path MVP. Nothing was physically
deleted — every hidden feature sits behind a feature flag and can be restored.

## Feature flags

| Flag | Default | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_MVP_MODE` | **on** (anything except the literal `false`) | Hides model picker, extra roadmaps, Learning Hub, Psych Test, Browse catalog, and switches nav to the single-path layout. |
| `NEXT_PUBLIC_BILLING_ENABLED` | `false` | Pre-existing. Keeps the product free-first (no plans/upgrade/crown). |

Flag source: `src/lib/flags.ts` (`MVP_MODE`), `src/lib/billing.ts` (`BILLING_ENABLED`).

### How to restore the full (non-MVP) product
Set `NEXT_PUBLIC_MVP_MODE=false` — locally in `apps/web/.env.local`, or in the
Vercel project env for a deployment — and redeploy. Everything hidden below
comes back with no code changes.

## Changes per task

**P0**
1. **AI model selector hidden** — `src/app/(app)/home/page.tsx`. `<ModelSwitcher/>`
   hidden; in MVP the persisted provider is ignored so chat always uses the
   keyless offline/mock provider (backend already falls back to mock).
2. **Single active roadmap** — `src/app/(app)/roadmap/page.tsx`. Multi-roadmap
   switcher tabs hidden; "New roadmap" → "Recreate roadmap" (`regenerateRoadmap`).
3. **Browse catalog removed** — `src/app/(app)/roadmap/page.tsx`. Both catalog
   buttons (header + empty state) hidden; `CatalogModal` retained.
4. **Unified learning** — `src/components/app/sidebar.tsx`,
   `src/components/app/mobile-nav.tsx`. Learning Hub dropped from both navs;
   roadmap-stage external links are the single learning source. Route retained.
5. **Single free tier** — `src/components/app/sidebar.tsx`, `src/lib/i18n-pages.ts`.
   Premium crown shown only when billing is enabled; "All features included" →
   neutral "Free". Profile was already free-first via `BILLING_ENABLED`.

**P1**
6. **Psych Test hidden (variant A)** — `src/components/app/sidebar.tsx`,
   `src/app/(app)/profile/page.tsx`. Sidebar entry + Profile RIASEC card hidden;
   AI Consultant is the role-matching path. 24-question flow unchanged (variant B
   left intact behind the flag).
7. **Shared Career role selector** — `src/app/(app)/career/page.tsx`. One target-role
   selector drives Resume Review, Mock Interview and Job Readiness; three
   duplicated `ROLE_OPTIONS` arrays and per-block role state removed. Applies in
   all modes.
8. **Course dedupe** — `src/app/(app)/learning/page.tsx`. Catalogue deduped by
   title at render (seed ships the same course from two instructors). Needs no
   DB reseed; holds with the flag off.
9. **Auto-advance lessons** — `src/app/(app)/learning/page.tsx`. Completing a
   lesson opens the next; button reads "Complete & Next" (`completeAndNext`).

**P2**
10. **Mobile nav reachability** — `src/components/app/mobile-nav.tsx`. MVP bottom
    bar is Home · Roadmap · Progress · Career · Profile (5, all fit); Profile
    added via `mvpOnly`. Full-mode nav unchanged.
11. **Jargon hints** — new `src/components/ui/info-hint.tsx`;
    `src/app/(app)/career/page.tsx`, `src/app/(app)/psych-test/page.tsx`.
    Hover/keyboard tooltip explaining Job Readiness score and the RIASEC code
    (`jobReadinessHint`, `riasecHint`).

### Supporting
- `src/lib/flags.ts` (new), `.env.example` — flag scaffolding.
- `src/components/app/sidebar.tsx`, `mobile-nav.tsx` — explicit `NavItem` type so
  the `mvpHidden`/`mvpOnly` flags are always on the element type.

## Not changed (per brief)
Design system, colors, fonts, sidebar layout; roadmap generation modal; Career
Prep as one screen with three blocks; Progress & Analytics.

## Verification
No local build is possible in this environment (no `node_modules`), so the Vercel
build is the compiler of record. i18n key parity (ru/uz/en) is TypeScript-enforced
via `typeof pagesEn`. The MVP single-path flow was not visually QA'd end-to-end —
the Vercel preview is behind SSO.
