# Deploying CareerOS on Vercel (API + Web) + Supabase (DB)

CareerOS runs on **two Vercel projects from one repo** plus **Supabase Postgres**.
Render is no longer used (it was removed — the free tier cold-starts ~50s, which is
the slowness this migration fixes; Vercel Fluid Compute keeps the function warm).

```
┌────────────────────┐      ┌────────────────────┐      ┌─────────────────────┐
│ nisahr-web         │ ───▶ │ nisahr-api         │ ───▶ │ Supabase Postgres   │
│ Vercel · apps/web  │ HTTP │ Vercel · apps/api  │  SQL │ (eu-central-1)      │
│ Next.js            │      │ NestJS (serverless)│      │ pooler :6543 / :5432│
└────────────────────┘      └────────────────────┘      └─────────────────────┘
```

## How the API runs serverless

- `apps/api/api/index.ts` is the Vercel function. Every request is rewritten to it
  (`vercel.json` → `rewrites: "/(.*)" → "/api"`), and it forwards into a **cached**
  Nest/Express instance built once per warm container (`src/app.factory.ts`).
- Nest keeps `setGlobalPrefix('api')`, so URLs are unchanged: `/api/health`,
  `/api/docs`, `/api/auth/...`.
- Swagger doc generation is skippable on cold start with `SWAGGER_ENABLED=false`.

## One-time setup

### 1. Supabase connection strings (Dashboard → Project → Database → Connection string)

- **Transaction pooler** (Supavisor, port **6543**) → this is the runtime `DATABASE_URL`.
  Append `?pgbouncer=true&connection_limit=1`.
- **Direct connection** (port **5432**) → this is `DIRECT_URL` (used only by migrations).

### 2. Create the API project on Vercel

- New Project → import this repo → **Root Directory = `apps/api`**.
- Enable **"Include files outside of the Root Directory"** (needed for the pnpm
  workspace + `packages/shared`). Vercel usually auto-detects the workspace.
- Framework preset: **Other** (config is in `apps/api/vercel.json`).
- Environment variables (Production + Preview):

  | Key | Value |
  | --- | --- |
  | `DATABASE_URL` | Supabase pooler URL (6543, `?pgbouncer=true&connection_limit=1`) |
  | `DIRECT_URL` | Supabase direct URL (5432) |
  | `JWT_ACCESS_SECRET` | strong random |
  | `JWT_REFRESH_SECRET` | strong random |
  | `JWT_ACCESS_TTL` | `900s` |
  | `JWT_REFRESH_TTL` | `7d` |
  | `CORS_ORIGIN` | the web origin, e.g. `https://nisahr-web.vercel.app` |
  | `AI_PROVIDER` | `mock` (or `openai` + `OPENAI_API_KEY` for a live LLM) |
  | `SWAGGER_ENABLED` | `false` in prod (optional; faster cold start) |
  | `NODE_ENV` | `production` |

### 3. Apply database migrations (once, and on every schema change)

Migrations do **not** run at request time. Run from a machine with the `DIRECT_URL`:

```bash
cd apps/api
DATABASE_URL="<direct 5432 url>" DIRECT_URL="<direct 5432 url>" pnpm prisma migrate deploy
# first-time only, to seed demo data:
DATABASE_URL="<direct 5432 url>" DIRECT_URL="<direct 5432 url>" pnpm prisma:seed
```

> ⚠️ The live Supabase DB is currently behind by 5 migrations (psych-test, roadmap
> graph, job-search cache, final assessment/certificate, oauth/email-verify).
> `migrate deploy` applies them. They are additive.

### 4. Point the web app at the API

In the **nisahr-web** Vercel project, set:

```
NEXT_PUBLIC_API_URL = https://<nisahr-api-domain>/api
```

Redeploy web. Confirm no CORS errors (the API's `CORS_ORIGIN` must include the web origin).

### 5. Tear down Render

Once the Vercel API is verified, delete the old `nisahr-api` service in the Render
dashboard. The `render.yaml` blueprint has already been removed from the repo.

## Verify

```bash
curl https://<nisahr-api-domain>/api/health          # 200
curl https://<nisahr-api-domain>/api/docs            # Swagger (if SWAGGER_ENABLED != false)
# then exercise login / roadmap from the web app
```

Measure a **cold** request (after ~15 min idle) to confirm the latency win over Render.

## Local dev is unchanged

`docker compose up --build` (or `make dev`) still runs Postgres + API + Web locally;
`DIRECT_URL` mirrors `DATABASE_URL` there.
