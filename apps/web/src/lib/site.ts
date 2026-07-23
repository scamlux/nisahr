/**
 * Central site metadata. Single source of truth for SEO helpers
 * (root layout, robots, sitemap, manifest, OpenGraph image).
 */

/** Production origin. Env-driven, with a safe Vercel fallback. */
export const siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nisahr-web.vercel.app';

/** Human-readable product name. */
export const siteName = 'CareerOS' as const;

/** Default meta description, reused across pages that don't override it. */
export const defaultDescription =
  'From "I don\'t know what to become" to "I got a job." AI-HR consultant, personalized roadmaps, learning hub, progress tracking and interview prep — in one platform.' as const;
