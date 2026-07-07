# Deploying the CareerOS API to Vercel (serverless) + Supabase

The API (`apps/api`, NestJS) runs on **Vercel as a single serverless function**; the web
app (`apps/web`, Next.js) already runs on Vercel. **Postgres stays on Supabase.** This
replaces the previous Render deployment.

```
Browser → Next.js (Vercel) → NestJS API (Vercel serverless fn) → Prisma → Postgres (Supabase)
```

## How it works

- `apps/api/api/index.ts` is the Vercel function. It calls `createApp()` (shared with the
  local `main.ts`), runs `app.init()` **without** `listen()`, and hands each request to the
  underlying Express instance. The warmed Nest app is cached across invocations.
- `apps/api/vercel.json` rewrites every path to that one function. Vercel rewrites are
  **internal and preserve `req.url`**, so Nest's global `/api` prefix still matches
  (e.g. `/api/health`).
- The Nest source is **pre-built with `nest build` (tsc)** in the Vercel `buildCommand`.
  We never let esbuild compile the Nest source directly — it drops `emitDecoratorMetadata`
  and breaks Nest DI.

## One-time Vercel project setup

Create a **second** Vercel project for the API (separate from the web project):

1. **Import** the same GitHub repo → new project.
2. **Root Directory:** `apps/api`.
3. **Settings → Build → enable “Include files outside the Root Directory”** — required so the
   repo-root `pnpm-workspace.yaml` and the `@careeros/shared` workspace package resolve.
4. Framework preset: **Other** (settings come from `vercel.json`).
5. Add the environment variables below, then **Deploy**.

`vercel.json` already provides:
- `installCommand`: `pnpm install --frozen-lockfile`
- `buildCommand`: builds `@careeros/shared`, then `nest build`, then `prisma generate`
- function `maxDuration: 300`, `memory: 1024` (300s is allowed even on Hobby with Fluid Compute — covers 20–60s OpenAI calls)

## Environment variables (Vercel dashboard)

| Var | Value |
|-----|-------|
| `DATABASE_URL` | Supabase **transaction pooler**, port **6543**: `postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase **direct/session**, port **5432**: `postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres` |
| `CORS_ORIGIN` | The web app's Vercel domain, e.g. `https://careeros.vercel.app` (comma-separate multiple) |
| `JWT_ACCESS_SECRET` | strong random string |
| `JWT_REFRESH_SECRET` | strong random string |
| `JWT_ACCESS_TTL` | `900s` |
| `JWT_REFRESH_TTL` | `7d` |
| `AI_PROVIDER` | `openai` (or `mock`) |
| `OPENAI_API_KEY` | your key |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `NODE_ENV` | `production` |

Why the two URLs: PgBouncer transaction mode (6543) can't hold prepared statements, so
`?pgbouncer=true` makes Prisma disable them and `connection_limit=1` keeps each serverless
instance to one pooled connection. DDL can't run over the pooler, so **migrations use the
direct 5432 `DIRECT_URL`**.

Point the **web** project's `NEXT_PUBLIC_API_URL` at the API deployment, e.g.
`https://<api-project>.vercel.app/api`.

## Migrations (run separately — never from the function)

Serverless functions must not run migrations at boot. Apply them from CI or locally against
the **direct** connection:

```bash
# from repo root, with DIRECT_URL exported (5432 Supabase URL)
pnpm --filter @careeros/api prisma:migrate   # = prisma migrate deploy
```

Seed once if needed: `pnpm --filter @careeros/api prisma:seed`.

## Verifying

- `GET https://<api-project>.vercel.app/api/health` → health payload.
- Swagger at `https://<api-project>.vercel.app/api/docs`.

## Render decommission

`render.yaml` is intentionally **kept in this PR** so there is no serving gap during cutover.
Once the Vercel API is confirmed serving and the web app points at it, delete `render.yaml`
and remove the Render service in a follow-up.
