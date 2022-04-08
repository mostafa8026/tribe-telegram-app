import { TribeModule } from '@mostafa8026/tribe-module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import tokenConfig from './configs/token.config';
import { LoggerModule } from './logger/logger.module';
import { SharedService } from './shared.service';

@Module({
  imports: [
    LoggerModule,
    TribeModule.forRootAsync({
      imports: [ConfigModule.forFeature(tokenConfig)],
      useFactory: (tribeOptions: ConfigType<typeof tokenConfig>) => {
        return tribeOptions;
      },
      inject: [tokenConfig.KEY],
    }),
  ],
  providers: [SharedService],
  exports: [SharedService, TribeModule],
})
export class SharedModule {}
