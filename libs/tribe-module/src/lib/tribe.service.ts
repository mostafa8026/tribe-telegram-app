import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  MemberFields,
  PostFields,
  TribeClient,
} from '@tribeplatform/gql-client';
import {
  Member,
  PaginatedPost,
  Post,
  PostListOrderByEnum,
  PostMappingTypeEnum,
  SpaceListOrderByEnum,
  SpaceType,
} from '@tribeplatform/gql-client/types';
import { TribeOption } from './config/tribe-options';
import { TRIBE_OPTION } from './constants/tribe.constants';

@Injectable()
export class TribeService implements OnModuleInit {
  private accessToken: string;

  constructor(
    @Inject(TRIBE_OPTION) private _tribeOption: TribeOption,
    private _tribeClient: TribeClient,
    private _logger: Logger
  ) {}

  async onModuleInit() {
    try {
      this.accessToken = await this._tribeClient.generateToken({
        networkId: this._tribeOption.networkId,
        memberId: this._tribeOption.memberId,
      });

      this._logger.debug(`Token generated succesfully, ${this.accessToken}`);
      this._tribeClient.setToken(this.accessToken);
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException(
        'Can not genrate Tribe Access token'
      );
    }
  }

  async login(username, password) {
    try {
      const authToken = this._tribeClient.auth.login(
        {
          input: {
            usernameOrEmail: username,
            password,
          },
        },
        'all'
      );

      return authToken;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException(
        'An error occured while authenticating user'
      );
    }
  }

  async getAllMembers() {
    try {
      const spaces = await this._tribeClient.members.list(
        {
          limit: 30,
        },
        'all',
        this.accessToken
      );
      return spaces;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get spaces');
    }
  }

  async likePost(postId: string) {
    try {
      return this._tribeClient.posts.addReaction(
        {
          postId,
          input: {
            reaction: '+1',
          },
        },
        'all',
        this.accessToken
      );
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not like the post');
    }
  }

  async addNewComment(postId: string, comment: string) {
    try {
      return this._tribeClient.posts.reply(
        postId,
        {
          input: {
            postTypeId: 'fasdf',
            mappingFields: [
              {
                key: 'content',
                type: PostMappingTypeEnum.TEXT,
                value: comment,
              },
            ],
          },
        },
        'all',
        this.accessToken
      );
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not create comment');
    }
  }

  async getAllSpaces() {
    try {
      const spaces = await this._tribeClient.spaces.list(
        {
          limit: 30,
          orderBy: SpaceListOrderByEnum.CREATED_AT,
          type: [SpaceType.GROUP],
        },
        'all',
        this.accessToken
      );
      return spaces;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get spaces');
    }
  }

  // async getAllComments() {
  //   try{
  //     const comments = await this._tribeClient.posts.replies({})
  //   }
  // }

  async getAllPosts(after?: string): Promise<PaginatedPost> {
    try {
      const posts = await this._tribeClient.posts.list(
        {
          after,
          limit: 1,
          orderBy: PostListOrderByEnum.CREATED_AT,
        },
        'all',
        this.accessToken
      );
      return posts;
    } catch (error) {
      this._logger.error(error.response);
      if (error.response.errors[0].code == 122) {
        // Everything is fine, there isn't any more post
        this._logger.log('No more post');
      } else {
        this._logger.error(error.response);
        throw new InternalServerErrorException('Can not get posts');
      }
    }
  }

  async getMemberByID(
    id: string,
    fields: MemberFields = 'all'
  ): Promise<Member> {
    try {
      const userInfo = await this._tribeClient.members.get(
        id,
        fields,
        this.accessToken
      );
      return userInfo;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get user info');
    }
  }

  async getPostById(id: string, fields: PostFields = 'all'): Promise<Post> {
    try {
      const postInfo = await this._tribeClient.posts.get(
        id,
        fields,
        this.accessToken
      );
      return postInfo;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get post info');
    }
  }
}
