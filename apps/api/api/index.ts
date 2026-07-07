import type { IncomingMessage, ServerResponse } from 'http';
// Imports the COMPILED Nest app from `dist/` (produced by `nest build` in the
// Vercel buildCommand). We deliberately do NOT import from `../src`: Vercel's
// @vercel/node bundles this file with esbuild, which drops `emitDecoratorMetadata`
// and would break Nest's DI. tsc-built `dist/` keeps that metadata intact.
import { createApp } from '../dist/create-app';

/**
 * Vercel serverless entrypoint for the NestJS API.
 *
 * A Vercel Node function is invoked with Node's `(req, res)` — the same signature
 * an Express app already satisfies — so we hand requests straight to the Express
 * instance underlying Nest. (serverless-express is an AWS Lambda `(event, context)`
 * adapter and is not needed here.)
 *
 * The catch-all rewrite in vercel.json (`/(.*)` → `/api`) preserves the original
 * request URL, so Nest's global `/api` prefix (e.g. `/api/health`) still matches.
 *
 * `cachedHandler` is module-scoped so the warmed Nest instance is reused across
 * invocations (and across concurrent requests under Fluid Compute).
 */
type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

let cachedHandler: NodeHandler | undefined;

async function bootstrap(): Promise<NodeHandler> {
  const app = await createApp();
  await app.init(); // wire DI + middleware WITHOUT opening a listener
  return app.getHttpAdapter().getInstance() as NodeHandler;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  cachedHandler ??= await bootstrap();
  cachedHandler(req, res);
}
