import { TribeService } from '@mostafa8026/tribe-module';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '@tribe-telegram-app/shared';
import { RoleType } from '@tribeplatform/gql-client/types';
import { Repository } from 'typeorm';
import { DispatcherService } from '../telegram/services/dispatcher.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly _postRepository: Repository<PostEntity>,
    private readonly _tribeService: TribeService,
    private readonly _logger: LoggerService,
    private readonly _dispatcherService: DispatcherService,
    private readonly _userService: UserService
  ) {
    this._logger.setContext(PostService.name);
  }

  save(post: PostEntity) {
    return this._postRepository.save(post);
  }

  private syncInProgress = false;

  // Commented, as I'm trying to implement webhook.
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async syncPosts() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      const users = await this._userService.getAll();
      let adminUsers: UserEntity[] = [];
      await Promise.all(
        users.map(async (user) => {
          const userTribe = await this._tribeService.getMemberByID(
            user.tribeId,
            { role: 'basic' }
          );
          console.log(userTribe);
          if (userTribe.role.type == RoleType.ADMIN) {
            adminUsers.push(user);
          }
        })
      );
      const lastPost = await this._postRepository.find({
        take: 1,
        order: { createdAt: 'DESC' },
      });
      try {
        const posts = await this._tribeService.getAllPosts(
          lastPost?.pop()?.createdAt.toString()
        );
        posts?.nodes?.map(async (post) => {
          this._logger.debug('new post received, ' + post?.id);
          const postEntity = new PostEntity();
          postEntity.tribePostId = post.id;
          await this._postRepository.save(postEntity);
          console.log(post);

          await Promise.all(
            adminUsers.map(async (user) => {
              this._logger.debug('Try to send message to: ' + user.chatId);
              await this._dispatcherService.sendMessage(
                user,
                `New post has been added, https://decodl.tribeplatform.com/general/post/${post.id}`
              );
            })
          );
        });
      } catch (error) {
        this._logger.error(error);
      }
    } finally {
      this.syncInProgress = false;
    }
  }
}
