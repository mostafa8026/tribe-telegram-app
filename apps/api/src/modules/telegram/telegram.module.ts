import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@tribe-telegram-app/shared';
import { UserModule } from '../user/user.module';
import botConfig from './configs/bot.config';
import proxyConfig from './configs/proxy.config';
import { HomeController } from './handlers/home.controllers';
import { DispatcherService } from './services/dispatcher.service';

@Module({
  imports: [
    ConfigModule.forFeature(botConfig),
    ConfigModule.forFeature(proxyConfig),
    UserModule,
    SharedModule,
  ],
  providers: [DispatcherService],
  controllers: [HomeController],
})
export class TelegramModule {}
