import { TribeService } from '@mostafa8026/tribe-module';
import { Controller } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { HandlerData } from '../classes/handler-data';
import { Key } from '../constants/key.enum';
import { Pages } from '../constants/pages.enum';
import { TelegramPage } from '../decorators/telegram-page.decorator';
import { DispatcherService } from '../services/dispatcher.service';

@Controller()
export class HomeController {
  constructor(
    private _dispatcherService: DispatcherService,
    private _tribeService: TribeService,
    private _userService: UserService
  ) {}

  @TelegramPage(Pages.Home)
  async index(handlerData: HandlerData) {
    console.log(handlerData);
    if (handlerData.telegramMessage.text) {
      if (handlerData.telegramMessage.text === Key.Logout) {
        handlerData.user.tribeId = null;
        this._userService.save(handlerData.user);
        this._dispatcherService.sendMessage(
          handlerData.user,
          'Successfully logged out!',
          true
        );
        return this._dispatcherService.redirect(
          handlerData.telegramMessage,
          handlerData.user,
          Pages.HomeIntro
        );
      }
    }

    return this._dispatcherService.sendMessage(
      handlerData.user,
      `
hey, 👋
Do you want me to greet you, send me /greetings
.`,
      false,
      {
        reply_markup: {
          keyboard: this._dispatcherService.formatKeyboard(
            [{ text: Key.Logout }],
            2
          ),
        },
      }
    );
  }

  @TelegramPage(Pages.HomeIntro)
  async homeIntroHandler(handlerData: HandlerData) {
    const userNameMessage = `hey, 👋, You have to login with your tribe account, please send your username...`;
    const passwordMessage = 'Please send me your password...';

    if (!handlerData.user.pageOptions) {
      handlerData.user.pageOptions = { options: {} };
    }

    if (!handlerData.user.pageOptions?.options?.waitForUserName) {
      handlerData.user.pageOptions.options = { waitForUserName: true };
      return this._dispatcherService.sendMessage(
        handlerData.user,
        userNameMessage,
        true
      );
    } else if (!handlerData.user.pageOptions?.options?.waitForPassword) {
      handlerData.user.pageOptions.options.username =
        handlerData.telegramMessage.text;
      handlerData.user.pageOptions.options.waitForPassword = true;
      return this._dispatcherService.sendMessage(
        handlerData.user,
        passwordMessage,
        true
      );
    } else {
      handlerData.user.pageOptions.options.password =
        handlerData.telegramMessage.text;
      try {
        const tribeUser = await this._tribeService.login(
          handlerData.user.pageOptions.options.username,
          handlerData.user.pageOptions.options.password
        );
        handlerData.user.tribeId = tribeUser.member.id;
        handlerData.user.pageOptions = null;
        handlerData.user.accessToken = tribeUser.accessToken;
        this._userService.save(handlerData.user);

        return this._dispatcherService.redirect(
          handlerData.telegramMessage,
          handlerData.user,
          Pages.Home
        );
      } catch (error) {
        handlerData.user.pageOptions = null;
        this._dispatcherService.sendMessage(
          handlerData.user,
          '🛑 Username or password is incorrect, please try again 🛑',
          true
        );
        return this._dispatcherService.redirect(
          handlerData.telegramMessage,
          handlerData.user,
          Pages.HomeIntro
        );
      }
    }
  }

  @TelegramPage(Pages.Greetings)
  async Greetings(handlerData: HandlerData) {
    return this._dispatcherService.sendMessage(
      handlerData.user,
      'Nice to see you, ❤️'
    );
  }
}
