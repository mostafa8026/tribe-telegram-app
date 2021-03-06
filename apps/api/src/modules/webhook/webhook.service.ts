import { TribeService } from '@mostafa8026/tribe-module';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '@tribe-telegram-app/shared';
import { RoleType } from '@tribeplatform/gql-client/types';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { Repository } from 'typeorm';
import { QueryOption } from '../base-option-entity';
import { PostEntity } from '../post/entities/post.entity';
import { PostService } from '../post/post.service';
import { Pages } from '../telegram/constants/pages.enum';
import { DispatcherService } from '../telegram/services/dispatcher.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { HookTypes } from './constants/hook-types.enum';
import { TestHookDto as WebHookResponseDto } from './dtos/test-hook.dto';
import { WebhookAuditEntity } from './entities/webhook-audit.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookAuditEntity)
    private readonly _webhookAuditRepository: Repository<WebhookAuditEntity>,
    private readonly _logger: LoggerService,
    private readonly _tribeService: TribeService,
    private readonly _postService: PostService,
    private readonly _dispatcherService: DispatcherService,
    private readonly _userService: UserService
  ) {
    this._logger.setContext(WebhookService.name);
  }

  testHookHandler(body) {
    return new WebHookResponseDto({
      type: HookTypes.TEST,
      status: 'SUCCEEDED',
      data: body.data,
    });
  }

  getWebhookAuditById(id: string) {
    return this._webhookAuditRepository.findOneBy({ id });
  }

  saveWebhookAudit(webhookAuditEntity: WebhookAuditEntity) {
    return this._webhookAuditRepository.save(webhookAuditEntity);
  }

  async postPublishHandler(postId, repliedToId, ownerId) {
    this._logger.debug(
      `New post published, let's go handle it, postId: ${postId}, repliedToId: ${repliedToId}, ownerId: ${ownerId}`
    );

    const tribePost = await this._tribeService.getPostById(postId);
    const postEntity = new PostEntity();
    postEntity.tribePostId = tribePost.id;
    await this._postService.save(postEntity);

    // get admin users
    const users = await this._userService.getAllLoggedInTelegram();
    // target users include admin users + the ownerId
    let targetUsers: UserEntity[] = [];
    await Promise.all(
      users.map(async (user) => {
        const userTribe = await this._tribeService.getMemberByID(user.tribeId, {
          role: 'basic',
        });
        console.log(userTribe);
        if (userTribe.role.type == RoleType.ADMIN || userTribe.id == ownerId) {
          targetUsers.push(user);
        }
      })
    );

    // send message about new post to all admin users
    await Promise.all(
      targetUsers.map(async (user) => {
        this._logger.debug('Try to send message to: ' + user.chatId);
        let queryOption: QueryOption = {
          options: {
            postId,
            user,
          },
        };
        const postMsg = '???? New post has been added';
        const replyMsg = '???? New reply has been received';

        await this._dispatcherService.sendMessage(
          user,
          `${
            repliedToId ? replyMsg : postMsg
          },\n???? ${this._tribeService.getPostUrl(
            postId
          )} \n???? Reply your comment or like it with the following button`,
          false,
          {
            reply_markup: {
              inline_keyboard: await this._dispatcherService.formatKeyboard(
                [
                  {
                    text: '?????? Reply',
                    callback_data: await this._dispatcherService.compressData(
                      Pages.PostReply,
                      null,
                      queryOption
                    ),
                  },
                  {
                    text: '???? Like',
                    callback_data: await this._dispatcherService.compressData(
                      Pages.PostLike,
                      null,
                      queryOption
                    ),
                  },
                ] as InlineKeyboardButton[],
                2
              ),
            },
          }
        );
      })
    );
  }
}
