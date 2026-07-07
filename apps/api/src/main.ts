import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  configureApp(app);

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 CareerOS API running on http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
