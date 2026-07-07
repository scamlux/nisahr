import { Logger } from '@nestjs/common';
import { createApp } from './create-app';

/**
 * Local / Docker entrypoint — starts a long-running HTTP listener.
 * On Vercel the app is served by the serverless handler in `api/index.ts`,
 * which reuses `createApp()` and never calls `listen()`.
 */
async function bootstrap() {
  const app = await createApp();
  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 CareerOS API running on http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
