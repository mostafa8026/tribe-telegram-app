import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerService } from '@tribe-telegram-app/shared';
import { emojify } from 'node-emoji';
import * as TelegramBot from 'node-telegram-bot-api';
import { CallbackQuery } from 'node-telegram-bot-api';
import { QueryOption } from '../../base-option-entity';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { HandlerData } from '../classes/handler-data';
import { TelegramMessage } from '../classes/telegram-message';
import botConfig from '../configs/bot.config';
import proxyConfig from '../configs/proxy.config';
import { Pages } from '../constants/pages.enum';
import { MessageQueryOptionEntity } from '../entities/message-query-options';
import { MessageQueryOptionService } from './message-query-option.service';

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
    private readonly _logger: LoggerService,
    private readonly _userService: UserService,
    private readonly _messageQueryOptionService: MessageQueryOptionService
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
      const telegramMessage = new TelegramMessage();
      telegramMessage.message = message;
      telegramMessage.text = message.text;
      telegramMessage.isCallback = false;
      telegramMessage.page = null;
      telegramMessage.pageOptions = null;
      await this.dispatch(telegramMessage);
    });
    this.bot.on('callback_query', async (msg: CallbackQuery) => {
      this._logger.debug('callback received ' + JSON.stringify(msg));
      const data = msg.data;
      const { pageAction, message, options } = await this.decompressData(data);
      this._logger.debug(`pageAction is ${pageAction}`);
      const telegramMessage = new TelegramMessage();
      telegramMessage.message = msg.message;
      telegramMessage.message.from = msg.from;
      telegramMessage.callback = msg;
      telegramMessage.text = message;
      telegramMessage.isCallback = true;
      telegramMessage.page = pageAction;
      telegramMessage.pageOptions = options;
      await this.dispatch(telegramMessage);
    });
  }

  async compressData(
    pageAction: string,
    message = null,
    options: QueryOption = {}
  ) {
    let row = new MessageQueryOptionEntity();
    row.pageOptions = {
      pageAction: pageAction,
      message: message + '', // convert to string
      options: options,
    };
    row = await this._messageQueryOptionService.save(row);
    this._logger.debug(
      `data has been compressed and save in: ${JSON.stringify(row)}`
    );
    return `${row.id}`; // convert to string
  }

  async decompressData(id): Promise<QueryOption> {
    const row = await this._messageQueryOptionService.getById(id);
    if (!row) {
      return {
        pageAction: Pages.Home,
        message: null,
        options: {},
      };
    }
    this._logger.debug(`Decompressed data is: ${JSON.stringify(row)}`);
    return row.pageOptions;
  }

  async onApplicationShutdown() {
    this._logger.debug('Going to be shutdown');
    await this.bot.stopPolling();
  }

  setPages(pages) {
    this.pages = pages;
  }

  async dispatch(telegramMessage: TelegramMessage) {
    this._logger.debug(`Dispatching the ${JSON.stringify(telegramMessage)}`);
    let page = Pages.Home;
    const message = telegramMessage.message;

    // find user
    let user = await this._userService.getByChatId(message.from.id);

    if (!user) {
      user = new UserEntity();
      user.chatId = message.from.id;
      user.page = page = Pages.HomeIntro;
      user.pageOptions = { options: {} };
      user = await this._userService.save(user);
    } else if (!user.tribeId) {
      page = Pages.HomeIntro;
    } else {
      if (telegramMessage.page) {
        page =
          Object.values(Pages).find(
            (_, index, obj) => obj[index] === telegramMessage.page
          ) ?? Pages.Home;
        user.pageOptions = telegramMessage.pageOptions;

        this._logger.debug(
          `Callback receive, page: ${page}, pageOptions: ${telegramMessage.pageOptions}`
        );
      } else if (telegramMessage.text === '/start') {
        page = Pages.Home;
      } else if (telegramMessage.text === '/greetings') {
        page = Pages.Greetings;
      }
    }

    return this.run(telegramMessage, user, page);
  }

  async run(message: TelegramMessage, user: UserEntity, page: string) {
    this._logger.debug('RUN_ACTION run this pageAction ' + page);

    const handler = this.pages.get(page);

    if (!handler) {
      this._logger.debug(`pages: ` + JSON.stringify(this.pages));
      this._logger.error(`page ${page} not found`);
      return false;
    }

    user.page = page;
    this._userService.save(user);

    const handlerData = new HandlerData();
    handlerData.telegramMessage = message;
    handlerData.user = user;

    return handler(handlerData);
  }

  async sendMessage(
    receiver: UserEntity,
    text: string,
    hideKeyboard = false,
    options: TelegramBot.SendMessageOptions = {}
  ) {
    await this._userService.save(receiver);
    if (hideKeyboard) {
      options.reply_markup = {
        remove_keyboard: true,
      };
    }
    return await this.bot.sendMessage(receiver.chatId, text, options);
  }

  async redirect(telegramMessage: TelegramMessage, user, newPage: string) {
    return this.run(telegramMessage, user, newPage);
  }

  formatKeyboard(flatArray, maxColumn = 3) {
    const result = [];
    let counter = maxColumn;
    let row = [];
    for (const item of flatArray) {
      if (item?.text) {
        item.text = emojify(item.text);
      }
      if (counter == 0) {
        result.push(row);
        row = [];
        counter = maxColumn;
      }
      row.push(item);
      counter--;
    }
    if (row.length > 0) {
      result.push(row);
    }
    return result;
  }
}
