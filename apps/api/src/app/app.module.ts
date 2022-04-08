import { TribeModule } from '@mostafa8026/tribe-module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SharedModule } from '@tribe-telegram-app/shared';
import { TelegramModule } from '../modules/telegram/telegram.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import tokenConfig from './config/token.config';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot(),
    TribeModule.forRootAsync({
      imports: [ConfigModule.forFeature(tokenConfig)],
      useFactory: (tribeOptions: ConfigType<typeof tokenConfig>) => {
        return tribeOptions;
      },
      inject: [tokenConfig.KEY],
    }),
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
