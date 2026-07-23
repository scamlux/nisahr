# CareerOS — Production Setup Checklist

CareerOS is **free-first / zero-key**: every feature runs on mock providers with no
credentials. This file lists what to configure to switch each feature from the
mock to a **real provider**, and how to deploy on Vercel.

All secrets go in the **Vercel project → Settings → Environment Variables** (never
commit them — `apps/api/.env` is gitignored). After changing env vars, redeploy.

---

## 1. Database (Supabase) — required

| Var | Where | Notes |
|-----|-------|-------|
| `DATABASE_URL` | API | **Transaction pooler** URL, port `6543`, must end with `?pgbouncer=true&connection_limit=1`. Serverless will exhaust connections otherwise. |
| `DIRECT_URL` | API | Direct connection, port `5432`. Used only by `prisma migrate`. |

**Run migrations after every schema change** (not part of the Vercel build):

```bash
cd apps/api
DATABASE_URL="<direct 5432 url>" pnpm prisma migrate deploy
pnpm prisma:seed        # optional demo data
```

## 2. Auth secrets — required in production

The API now **refuses to boot in production** if these are missing or left as the
`*_change_me` placeholders (see `apps/api/src/config/secrets.ts`).

| Var | Notes |
|-----|-------|
| `JWT_ACCESS_SECRET` | strong random string (`openssl rand -base64 48`) |
| `JWT_REFRESH_SECRET` | different strong random string |
| `CORS_ORIGIN` | your web origin, e.g. `https://app.yourdomain.com` |

## 3. AI chat (F3) — OpenAI / others

| Var | Notes |
|-----|-------|
| `AI_PROVIDER` | `openai` \| `gemini` \| `groq` \| `openrouter` \| `mock` |
| `OPENAI_API_KEY` + `OPENAI_MODEL` | already set in your `.env`; real chat works today |

Falls back to the mock provider automatically if a key is missing — never hard-fails.

## 4. Real Google sign-in (F7)

Set both and the zero-key "mock Google" login is **automatically disabled**:

| Var | Notes |
|-----|-------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud → OAuth 2.0 credentials |
| `GOOGLE_REDIRECT_URI` | `https://<api-domain>/api/auth/google/callback` — add it to the authorized redirect URIs |

## 5. Email verification (F7) — Resend

| Var | Notes |
|-----|-------|
| `MAIL_ENABLED` | `true` to make signups start unverified and send a verify email |
| `RESEND_API_KEY` | from resend.com; without it the link is only logged |
| `MAIL_FROM` | e.g. `CareerOS <no-reply@yourdomain.com>` (verify the domain in Resend) |
| `APP_URL` | web origin, used to build the link in the email |

> **TODO (frontend):** the verify link points at `/verify-email?token=…`. Add a web
> page at that route that POSTs the token to `/api/auth/verify-email`. (The existing
> `/verify/[token]` route is for **certificate** verification, a different feature.)

## 6. Stripe billing (real PREMIUM upgrades)

| Var | Notes |
|-----|-------|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `STRIPE_PRICE_PREMIUM` | a recurring Price ID for the PREMIUM plan |
| `BILLING_ENABLED` | `true` to turn on plan gating across the app |
| `APP_URL` | used for the checkout success/cancel redirects |

Flow implemented (`apps/api/src/config/stripe.ts`, `subscription` module):
`POST /subscription/checkout` → hosted Stripe Checkout → returns to
`/profile?upgrade=success&session_id=…` → `POST /subscription/confirm` verifies the
session **server-side** (spoof-proof) and activates the plan. Direct free upgrades
are refused once Stripe is configured.

> **Recommended hardening:** add a Stripe **webhook** (`checkout.session.completed`,
> `customer.subscription.deleted`) to handle renewals/cancellations, and a
> `stripeSubscriptionId` column on `Subscription` to correlate them. Confirm-on-return
> covers the upgrade path but not async lifecycle events.

## 7. Vercel deploy

Two projects (monorepo): **web** (Next.js) and **api** (`apps/api/vercel.json`,
NestJS serverless in `fra1`).

- API build: `pnpm --filter @careeros/shared build && prisma generate && nest build` (already in `vercel.json`).
- Set `SWAGGER_ENABLED=false` in production (avoids cold-start cost).
- Web needs `NEXT_PUBLIC_API_URL=https://<api-domain>/api`.
- Migrations are **not** run by the build — run `prisma migrate deploy` out-of-band (step 1).
