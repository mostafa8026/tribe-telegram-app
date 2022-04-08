import { TribeService } from '@mostafa8026/tribe-module';
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'libs/shared/src/lib/logger/logger.service';

@Injectable()
export class AppService {
  constructor(
    private _tribeService: TribeService,
    private _logger: LoggerService
  ) {
    this._logger.setContext(AppService.name);
  }

  getData(): { message: string } {
    this._logger.log('Teting the logger, welcome to the world of logging');
    return { message: 'Welcome to api!' };
  }

  getPosts() {
    return this._tribeService.getAllPosts();
  }
}
