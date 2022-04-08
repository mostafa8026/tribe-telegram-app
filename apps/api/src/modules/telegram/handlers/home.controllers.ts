import { Controller } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { TelegramPage } from '../decorators/telegram-page.decorator';
import { DispatcherService } from '../services/dispatcher.service';

@Controller()
export class HomeController {
  constructor(private _dispatcherService: DispatcherService) {}

  @TelegramPage('Home')
  async index(message: TelegramBot.Message) {
    return this._dispatcherService.sendMessage(
      message.from.id,
      `
hey, 👋
For now I just can greet you, send me /greetings
.`
    );
  }

  @TelegramPage('Greetings')
  async Greetings(message: TelegramBot.Message) {
    return this._dispatcherService.sendMessage(
      message.from.id,
      'Nice to see you, ❤️'
    );
  }
}
