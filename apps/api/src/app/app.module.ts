import { TribeModule } from '@mostafa8026/tribe-module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SharedModule } from '@tribe-telegram-app/shared';
import tokenConfig from '../config/token.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
