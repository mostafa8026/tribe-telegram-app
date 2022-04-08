import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerService } from '@tribe-telegram-app/shared';
import * as TelegramBot from 'node-telegram-bot-api';
import { CallbackQuery } from 'node-telegram-bot-api';
import botConfig from '../configs/bot.config';
import proxyConfig from '../configs/proxy.config';

@Injectable()
export class DispatcherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  bot: TelegramBot;
  pages: Map<string, any> = new Map<string, any>();

  constructor(
    @Inject(botConfig.KEY)
    private readonly botConfigService: ConfigType<typeof botConfig>,
    @Inject(proxyConfig.KEY)
    private readonly proxyConfigService: ConfigType<typeof proxyConfig>,
    private readonly _logger: LoggerService
  ) {
    this._logger.setContext(DispatcherService.name);
  }

  onApplicationBootstrap() {
    const options: TelegramBot.ConstructorOptions = { polling: true };
    if (this.proxyConfigService.enabled) {
      const host = this.proxyConfigService.host;
      const port = this.proxyConfigService.port;
      const user = this.proxyConfigService.user;
      const pass = this.proxyConfigService.password;
      options.request = {
        url: '',
        proxy: `http://${user}:${pass}@${host}:${port}`,
      };
    }
    this.bot = new TelegramBot(this.botConfigService.token, options);

    this.bot.on('message', async (message) => {
      this._logger.debug('message received ' + JSON.stringify(message));
      await this.dispatch(message);
    });
    this.bot.on('callback_query', async (msg: CallbackQuery) => {
      this._logger.debug('callback received ' + JSON.stringify(msg));
    });
  }

  async onApplicationShutdown() {
    this._logger.debug('Going to be shutdown');
    await this.bot.stopPolling();
  }

  setPages(pages) {
    this.pages = pages;
  }

  async dispatch(message: TelegramBot.Message) {
    let page = 'Home';
    if (message.text === '/start') {
      page = 'Home';
    } else if (message.text === '/greetings') {
      page = 'Greetings';
    }

    return this.run(message, page);
  }

  async run(message: TelegramBot.Message, page: string) {
    this._logger.debug('RUN_ACTION run this pageAction ' + page);

    const handler = this.pages.get(page);

    if (!handler) {
      this._logger.debug(`pages: ` + JSON.stringify(this.pages));
      this._logger.error(`page ${page} not found`);
      return false;
    }

    return handler(message);
  }

  async sendMessage(receiver: number, text: string) {
    return await this.bot.sendMessage(receiver, text);
  }
}
