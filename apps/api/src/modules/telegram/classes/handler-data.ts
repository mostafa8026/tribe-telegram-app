import { UserEntity } from '../../user/entities/user.entity';
import { TelegramMessage } from './telegram-message';

export class HandlerData {
  telegramMessage: TelegramMessage;
  user: UserEntity;
}
