import { CallbackQuery, Message } from 'node-telegram-bot-api';

export class TelegramMessage {
  message: Message;
  callback: CallbackQuery;
  text: string;
  isCallback: boolean;
  page: string;
  pageOptions: { [key: string]: any };
}
