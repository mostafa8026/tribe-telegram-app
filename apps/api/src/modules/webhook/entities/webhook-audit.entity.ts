import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'WebhookAudit',
})
export class WebhookAuditEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    nullable: true,
  })
  type: string;

  @Column()
  name: string;

  @CreateDateColumn()
  receivedAt: Date;

  @Column()
  actorId: string;

  @Column()
  objectId: string;

  @Column()
  targetNetworkId: string;
}
