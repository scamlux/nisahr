import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Builds and fully configures the Nest application WITHOUT starting a listener.
 *
 * Shared by two entrypoints:
 *  - `main.ts`        → local/Docker: calls `createApp()` then `app.listen()`.
 *  - `api/index.ts`   → Vercel serverless: calls `createApp()` then `app.init()`
 *                       and wraps the underlying Express instance.
 *
 * Keep all cross-cutting config (CORS, global prefix, pipes, filters,
 * interceptors, Swagger) here so both runtimes behave identically.
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
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

  const config = new DocumentBuilder()
    .setTitle('CareerOS API')
    .setDescription('AI Career Operating System — REST API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  return app;
}
