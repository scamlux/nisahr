import { Logger } from '@nestjs/common';
import { appUrl } from './mail';

const logger = new Logger('Stripe');
const STRIPE_API = 'https://api.stripe.com/v1';

/** True when real Stripe billing is configured. */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_PREMIUM?.trim());
}

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return key;
}

/** Low-level Stripe REST call (form-encoded, native fetch — no SDK dependency). */
async function stripeRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  form?: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    const msg = (data as { error?: { message?: string } }).error?.message ?? `Stripe error ${res.status}`;
    logger.error(`Stripe ${method} ${path} failed: ${msg}`);
    throw new Error(msg);
  }
  return data;
}

export interface CheckoutSession {
  id: string;
  url: string | null;
  status: string | null;
  payment_status: string | null;
  client_reference_id: string | null;
  metadata: Record<string, string> | null;
  subscription: string | null;
  customer: string | null;
}

/**
 * Create a Stripe Checkout Session for a PREMIUM subscription upgrade.
 * Returns the hosted checkout URL to redirect the user to.
 */
export async function createPremiumCheckout(userId: string, email: string): Promise<CheckoutSession> {
  const base = appUrl();
  return stripeRequest<CheckoutSession>('POST', '/checkout/sessions', {
    mode: 'subscription',
    'line_items[0][price]': process.env.STRIPE_PRICE_PREMIUM!.trim(),
    'line_items[0][quantity]': '1',
    client_reference_id: userId,
    customer_email: email,
    'metadata[userId]': userId,
    'metadata[plan]': 'PREMIUM',
    success_url: `${base}/profile?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/profile?upgrade=cancelled`,
    allow_promotion_codes: 'true',
  });
}

/** Retrieve a Checkout Session to verify payment on the return redirect. */
export function retrieveCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>('GET', `/checkout/sessions/${encodeURIComponent(sessionId)}`);
}
