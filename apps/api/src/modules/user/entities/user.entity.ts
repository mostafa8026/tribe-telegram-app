import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseOptionEntity } from '../../base-option-entity';

// TODO: It seems that repository creation is changed and TypeOrmModule has not been updated,
// therefor for no we don't use CustomRepository, more detail available at: https://github.com/typeorm/typeorm/pull/8616
// Whenever it's ready we can migrate to repository based.

@Entity({ name: 'users' })
export class UserEntity extends BaseOptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true })
  chatId: number;

  @Column({ nullable: true })
  tribeId: string;

  @Column()
  page: string;

  @Column({
    nullable: true,
    length: 4000,
  })
  accessToken: string;

  @CreateDateColumn()
  createdAt: Date;
}
