/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@tribe-telegram-app/shared';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const logger = new LoggerService();
  logger.setContext('Bootstrapping');
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
