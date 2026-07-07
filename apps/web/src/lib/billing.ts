/**
 * Free-first: CareerOS ships with billing disabled. Flip the env var to
 * resurface plans/upgrade UI — the code paths are kept, not deleted.
 */
export const BILLING_ENABLED = process.env.NEXT_PUBLIC_BILLING_ENABLED === 'true';
