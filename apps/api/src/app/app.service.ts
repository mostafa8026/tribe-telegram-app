import { TribeService } from '@mostafa8026/tribe-module';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private _tribeService: TribeService) {}

  getData(): { message: string } {
    return { message: 'Welcome to api!' };
  }

  getPosts() {
    return this._tribeService.getAllPosts();
  }
}
