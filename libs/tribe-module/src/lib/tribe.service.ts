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
  PostType,
  SpaceListOrderByEnum,
  SpaceType,
} from '@tribeplatform/gql-client/types';
import { TribeOption } from './config/tribe-options';
import { TRIBE_OPTION } from './constants/tribe.constants';

@Injectable()
export class TribeService implements OnModuleInit {
  private botAccessToken: string;
  private postTypes: PostType[];

  constructor(
    @Inject(TRIBE_OPTION) private _tribeOption: TribeOption,
    private _tribeClient: TribeClient,
    private _logger: Logger
  ) {}

  async onModuleInit() {
    try {
      this.botAccessToken = await this._tribeClient.generateToken({
        networkId: this._tribeOption.networkId,
      });

      this._logger.debug(`Token generated succesfully, ${this.botAccessToken}`);
      this._tribeClient.setToken(this.botAccessToken);
      this.postTypes = (await this.getPostTypes()).nodes;
      this._logger.debug(`Post types are: ${JSON.stringify(this.postTypes)}`);
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException(
        'Can not genrate Tribe Access token'
      );
    }
  }

  async getPostTypes(userAccessToken?: string) {
    try {
      return this._tribeClient.posts.listPostTypes(
        {
          limit: 10,
        },
        'all',
        userAccessToken ?? this.botAccessToken
      );
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get Post Types');
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

  async getAllMembers(userAccessToken?: string) {
    try {
      const spaces = await this._tribeClient.members.list(
        {
          limit: 30,
        },
        'all',
        userAccessToken ?? this.botAccessToken
      );
      return spaces;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get spaces');
    }
  }

  async likePost(postId: string, userAccessToken?: string) {
    try {
      return this._tribeClient.posts.addReaction(
        {
          postId,
          input: {
            reaction: '+1',
          },
        },
        'all',
        userAccessToken ?? this.botAccessToken
      );
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not like the post');
    }
  }

  getCommentPostType() {
    const commentPostType = this.postTypes.find((x) => x.name === 'Comment').id;
    this._logger.debug(`Comment Post Type is: ${commentPostType}`);
    return commentPostType;
  }

  async addNewComment(
    postId: string,
    comment: string,
    userAccessToken?: string
  ) {
    try {
      return this._tribeClient.posts.reply(
        postId,
        {
          input: {
            postTypeId: this.getCommentPostType(),
            publish: true,
            mappingFields: [
              {
                key: 'content',
                type: PostMappingTypeEnum.HTML,
                value: JSON.stringify(`<p>${comment}</p>`),
              },
            ],
          },
        },
        'all',
        userAccessToken ?? this.botAccessToken
      );
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not create comment');
    }
  }

  getPostUrl(postId: string) {
    return `https://decodl.tribeplatform.com/general/post/${postId}`;
  }

  async getAllSpaces(userAccessToken?: string) {
    try {
      const spaces = await this._tribeClient.spaces.list(
        {
          limit: 30,
          orderBy: SpaceListOrderByEnum.CREATED_AT,
          type: [SpaceType.GROUP],
        },
        'all',
        userAccessToken ?? this.botAccessToken
      );
      return spaces;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get spaces');
    }
  }

  async getAllPosts(
    after?: string,
    userAccessToken?: string
  ): Promise<PaginatedPost> {
    try {
      const posts = await this._tribeClient.posts.list(
        {
          after,
          limit: 1,
          orderBy: PostListOrderByEnum.CREATED_AT,
        },
        'all',
        userAccessToken ?? this.botAccessToken
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
    fields: MemberFields = 'all',
    userAccessToken?: string
  ): Promise<Member> {
    try {
      const userInfo = await this._tribeClient.members.get(
        id,
        fields,
        userAccessToken ?? this.botAccessToken
      );
      return userInfo;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get user info');
    }
  }

  async getPostById(
    id: string,
    fields: PostFields = 'all',
    userAccessToken?: string
  ): Promise<Post> {
    try {
      const postInfo = await this._tribeClient.posts.get(
        id,
        fields,
        userAccessToken ?? this.botAccessToken
      );
      return postInfo;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get post info');
    }
  }
}
