import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@tribe-telegram-app/shared';
import { TelegramModule } from '../telegram/telegram.module';
import { UserModule } from '../user/user.module';
import { PostEntity } from './entities/post.entity';
import { PostService } from './post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    ScheduleModule.forRoot(),
    SharedModule,
    TelegramModule,
    UserModule,
  ],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
