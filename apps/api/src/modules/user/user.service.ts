import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>
  ) {}

  getAll() {
    return this._userRepository.find();
  }

  getAllLoggedInTelegram() {
    return this._userRepository.find({
      where: {
        chatId: Not(IsNull()),
      },
    });
  }

  getByChatId(chatId: number) {
    return this._userRepository.findOne({ where: { chatId } });
  }

  save(user: UserEntity) {
    return this._userRepository.save(user);
  }
}
