import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'event_distribution' })
export class EventDistributionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'distribution_run_id' })
  distributionRunId!: string;

  @Index()
  @Column()
  document!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'biometric_id' })
  biometricId!: string;

  @Column()
  status!: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'processed_at', nullable: true })
  processedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
