import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@tribe-telegram-app/shared';
import { TelegramModule } from '../modules/telegram/telegram.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/orm.config';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(ormConfig)],
      useFactory: (ormConfigService: ConfigType<typeof ormConfig>) => {
        return {
          type: ormConfigService.type as any,
          host: ormConfigService.host,
          port: ormConfigService.port,
          username: ormConfigService.username,
          password: ormConfigService.password,
          database: ormConfigService.database,
          synchronize: ormConfigService.synchronize as boolean,
          logging: true,
          autoLoadEntities: true,
          ...(ormConfigService.extra && {
            extra: JSON.parse(ormConfigService.extra),
          }),
        };
      },
      inject: [ormConfig.KEY],
    }),

    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
