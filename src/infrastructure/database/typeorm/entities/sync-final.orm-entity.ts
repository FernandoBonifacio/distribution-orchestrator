import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('sync_final')
@Index(['tenantId', 'eventId'])
@Index(['distributionRunId'])
export class SyncFinalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId!: string;

  @Column({ name: 'event_id', type: 'varchar' })
  eventId!: string;

  @Column({ type: 'varchar' })
  document!: string;

  @Column({ name: 'biometric_id', type: 'varchar' })
  biometricId!: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl!: string;

  @Column({ name: 'distribution_run_id', type: 'uuid', nullable: true })
  distributionRunId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
