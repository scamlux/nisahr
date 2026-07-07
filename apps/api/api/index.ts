import type { IncomingMessage, ServerResponse } from 'http';
import { getServerlessApp } from '../src/app.factory';

/**
 * Vercel serverless entry for the CareerOS NestJS API.
 *
 * Every request is rewritten to this function (see vercel.json), which forwards
 * it into a cached, fully-initialised Express instance. The Nest app is built
 * once per warm container (Fluid Compute), so only the first cold request pays
 * the bootstrap cost.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getServerlessApp();
  app(req, res);
}
