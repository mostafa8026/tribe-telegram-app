import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { SharedService } from './shared.service';

@Module({
  imports: [LoggerModule],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}
