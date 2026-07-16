/**
 * MVP mode — the product ships as a lean, single-path MVP: one AI consultant,
 * one active roadmap, one learning source, no plan/tier UI, no side quests.
 *
 * Everything gated by `MVP_MODE` is HIDDEN, not deleted — the code paths stay
 * intact behind the flag so the full feature set can be restored instantly.
 *
 * Default: ON. Prod shows the MVP with no env var set. To bring the full
 * feature set back, set `NEXT_PUBLIC_MVP_MODE=false` (locally in .env.local, or
 * in the Vercel project env for a deployment).
 */
export const MVP_MODE = process.env.NEXT_PUBLIC_MVP_MODE !== 'false';
