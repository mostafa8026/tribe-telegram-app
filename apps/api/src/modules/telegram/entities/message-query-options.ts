import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseOptionEntity } from '../../base-option-entity';

@Entity({
  name: 'messageQueryOptions',
})
export class MessageQueryOptionEntity extends BaseOptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}
