import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { TribeClient } from '@tribeplatform/gql-client';
import {
  Member,
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

  async getAllPosts() {
    try {
      const posts = await this._tribeClient.posts.list(
        {
          limit: 10,
        },
        'all',
        this.accessToken
      );
      return posts;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get posts');
    }
  }

  async getMemberByID(id): Promise<Member> {
    try {
      const userInfo = await this._tribeClient.members.get(
        id,
        'all',
        this.accessToken
      );
      return userInfo;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException('Can not get user info');
    }
  }
}
