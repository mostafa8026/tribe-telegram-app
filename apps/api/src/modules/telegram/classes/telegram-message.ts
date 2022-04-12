import { CallbackQuery, Message } from 'node-telegram-bot-api';
import { QueryOption } from '../../base-option-entity';

export class TelegramMessage {
  message: Message;
  callback: CallbackQuery;
  text: string;
  isCallback: boolean;
  page: string;
  pageOptions: QueryOption;
}
