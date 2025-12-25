import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'event_distribution' })
export class EventDistributionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'distribution_run_id', type: 'uuid' })
  distributionRunId!: string;

  @Index()
  @Column({ type: 'varchar' })
  document!: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Column({ name: 'event_id', type: 'varchar' })
  eventId!: string;

  @Column({ name: 'biometric_id', type: 'varchar' })
  biometricId!: string;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ name: 'error_message', type: 'varchar', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
