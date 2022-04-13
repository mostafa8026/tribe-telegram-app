import { TribeService } from '@mostafa8026/tribe-module';
import { Controller } from '@nestjs/common';
import { LoggerService } from '@tribe-telegram-app/shared';
import { UserEntity } from '../../user/entities/user.entity';
import { HandlerData } from '../classes/handler-data';
import { Pages } from '../constants/pages.enum';
import { TelegramPage } from '../decorators/telegram-page.decorator';
import { DispatcherService } from '../services/dispatcher.service';

interface postOptions {
  postId: string;
  user: UserEntity;
  waitForReply?: boolean;
  replyMessage?: string;
}

@Controller()
export class PostController {
  constructor(
    private _dispatcherService: DispatcherService,
    private _tribeService: TribeService,
    private _logger: LoggerService
  ) {
    this._logger.setContext(PostController.name);
  }

  @TelegramPage(Pages.PostReply)
  async postReplyHandler(handlerData: HandlerData) {
    this._logger.debug(`Handling Post Reply ${JSON.stringify(handlerData)}`);

    const options = handlerData.telegramMessage.pageOptions
      .options as postOptions;

    if (!options.waitForReply) {
      options.waitForReply = true;
      handlerData.user.page = handlerData.telegramMessage.page;
      handlerData.user.pageOptions = {
        pageAction: handlerData.telegramMessage.pageOptions.pageAction,
        message: handlerData.telegramMessage.pageOptions.message,
        options,
      };
      return this._dispatcherService.sendMessage(
        handlerData.user,
        'Please send me your reply ....'
      );
    } else {
      if (handlerData.telegramMessage.text) {
        handlerData.user.pageOptions = null;
        this._logger.debug(
          `Going to send comment: ${handlerData.telegramMessage.text} to the ${options.postId}`
        );
        const comment = await this._tribeService.addNewComment(
          options.postId,
          handlerData.telegramMessage.text,
          handlerData.user.accessToken
        );
        await this._dispatcherService.sendMessage(
          handlerData.user,
          `💐 Your comment has been successfully inserted, commnetId: ${
            comment.id
          } \n🔗 ${this._tribeService.getPostUrl(options.postId)}`
        );
        return this._dispatcherService.redirect(
          handlerData.telegramMessage,
          handlerData.user,
          Pages.Home
        );
      }
    }
  }

  @TelegramPage(Pages.PostLike)
  async homeIntroHandler(handlerData: HandlerData) {
    try {
      this._logger.debug(`Handling Post Like ${JSON.stringify(handlerData)}`);

      const options = handlerData.telegramMessage.pageOptions
        .options as postOptions;

      this._logger.debug(`Going to like postId: ${options.postId}`);
      await this._tribeService.likePost(
        options.postId,
        handlerData.user.accessToken
      );
      handlerData.user.pageOptions = null;
      await this._dispatcherService.sendMessage(
        handlerData.user,
        `Post has been liked, Hooray!`
      );
      return this._dispatcherService.redirect(
        handlerData.telegramMessage,
        handlerData.user,
        Pages.Home
      );
    } catch (error) {
      this._logger.error(error);
      await this._dispatcherService.sendMessage(
        handlerData.user,
        `We have some problems right now, please try again later`
      );
    }
  }
}
