/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { LoggerService } from '@tribe-telegram-app/shared';
import { AppModule } from './app/app.module';
import { TelegramServer } from './modules/telegram/telegram.server';

async function bootstrap() {
  const logger = new LoggerService();
  logger.setContext('Bootstrapping');
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.connectMicroservice<MicroserviceOptions>({
    strategy: new TelegramServer(app),
  });

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT || 3333;
  await app.listen(port);
  await app.startAllMicroservices();
  
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
