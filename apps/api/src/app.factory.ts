import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Apply CORS, global prefix, pipes, filters, interceptors and (optionally) Swagger.
 * Shared by the long-running server (main.ts) and the Vercel serverless handler
 * (api/index.ts) so both stay behaviourally identical.
 */
export function configureApp(app: INestApplication): void {
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger doc generation is expensive on cold start; disable via SWAGGER_ENABLED=false
  // (defaults on, so local/dev keep /api/docs).
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('CareerOS API')
      .setDescription('AI Career Operating System — REST API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
}

let cachedApp: INestApplication | null = null;
let cachedExpress: Express | null = null;

/**
 * Build (once) and return the configured Nest app plus its underlying Express
 * instance. On Vercel the module is kept warm, so subsequent invocations reuse
 * the same initialised app instead of paying the full bootstrap cost again.
 */
export async function getServerlessApp(): Promise<Express> {
  if (cachedExpress) return cachedExpress;

  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  configureApp(app);
  await app.init();

  cachedApp = app;
  cachedExpress = app.getHttpAdapter().getInstance() as Express;
  return cachedExpress;
}

export function getCachedApp(): INestApplication | null {
  return cachedApp;
}
