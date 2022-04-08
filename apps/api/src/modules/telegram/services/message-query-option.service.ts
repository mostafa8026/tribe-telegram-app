import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageQueryOptionEntity } from '../entities/message-query-options';

@Injectable()
export class MessageQueryOptionService {
  constructor(
    @InjectRepository(MessageQueryOptionEntity)
    private readonly _queryOptionRepository: Repository<MessageQueryOptionEntity>
  ) {}

  getById(id: number) {
    return this._queryOptionRepository.findOneBy({ id });
  }

  save(messageQueryOption: MessageQueryOptionEntity) {
    return this._queryOptionRepository.save(messageQueryOption);
  }
}
