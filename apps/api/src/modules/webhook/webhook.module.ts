import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@tribe-telegram-app/shared';
import tokenConfig from 'libs/shared/src/lib/configs/token.config';
import { PostModule } from '../post/post.module';
import { TelegramModule } from '../telegram/telegram.module';
import { UserModule } from '../user/user.module';
import { WebhookAuditEntity } from './entities/webhook-audit.entity';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([WebhookAuditEntity]),
    ConfigModule.forFeature(tokenConfig),
    TelegramModule,
    PostModule,
    UserModule
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
