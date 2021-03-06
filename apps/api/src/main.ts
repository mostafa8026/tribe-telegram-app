/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from '@tribe-telegram-app/shared';
import * as bodyParser from 'body-parser';
import { AppModule } from './app/app.module';
import { TelegramServer } from './modules/telegram/telegram.server';

async function bootstrap() {
  const logger = new LoggerService();
  logger.setContext('Bootstrapping');
  const app = await NestFactory.create(AppModule, {
    logger: logger,
    bodyParser: false,
  });

  const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  };

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.connectMicroservice<MicroserviceOptions>({
    strategy: new TelegramServer(app),
  });

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Tribe Telegram App')
    .setDescription('The Tribe Telegram App Integration, API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  await app.startAllMicroservices();

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
