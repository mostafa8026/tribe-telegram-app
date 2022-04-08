import { applyDecorators } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

export function TelegramPage(page: string) {
  return applyDecorators(MessagePattern(page));
}
