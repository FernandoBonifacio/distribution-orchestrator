import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'distribution_run' })
export class DistributionRunOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column()
  status!: string;

  @Column({ name: 'total_found', type: 'int', default: 0 })
  totalFound!: number;

  @Column({ name: 'total_eligible', type: 'int', default: 0 })
  totalEligible!: number;

  @Column({ name: 'total_processed', type: 'int', default: 0 })
  totalProcessed!: number;

  @Column({ name: 'total_distributed', type: 'int', default: 0 })
  totalDistributed!: number;

  @Column({ name: 'total_failed', type: 'int', default: 0 })
  totalFailed!: number;

  @Column({ name: 'total_duplicated', type: 'int', default: 0 })
  totalDuplicated!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt?: Date;
}
