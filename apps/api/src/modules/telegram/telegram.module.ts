import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@tribe-telegram-app/shared';
import { UserModule } from '../user/user.module';
import botConfig from './configs/bot.config';
import proxyConfig from './configs/proxy.config';
import { MessageQueryOptionEntity } from './entities/message-query-options';
import { HomeController } from './handlers/home.controllers';
import { DispatcherService } from './services/dispatcher.service';
import { MessageQueryOptionService } from './services/message-query-option.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageQueryOptionEntity]),
    ConfigModule.forFeature(botConfig),
    ConfigModule.forFeature(proxyConfig),
    UserModule,
    SharedModule,
  ],
  providers: [DispatcherService, MessageQueryOptionService],
  controllers: [HomeController],
})
export class TelegramModule {}
