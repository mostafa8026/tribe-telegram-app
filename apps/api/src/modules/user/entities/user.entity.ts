import { Entity, PrimaryGeneratedColumn } from 'typeorm';

// TODO: It seems that repository creation is changed and TypeOrmModule has not been updated,
// therefor for no we don't use CustomRepository, more detail available at: https://github.com/typeorm/typeorm/pull/8616
// Whenever it's ready we can migrate to repository based.

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
