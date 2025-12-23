import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'distribution_run' })
export class DistributionRunOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'status' })
  status!: string;

  @Column({ name: 'total_found', type: 'int', default: 0 })
  totalFound!: number;

  @Column({ name: 'total_eligible', type: 'int', default: 0 })
  totalEligible!: number;

  @Column({ name: 'total_distributed', type: 'int', default: 0 })
  totalDistributed!: number;

  @Column({ name: 'total_failed', type: 'int', default: 0 })
  totalFailed!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ name: 'finished_at', nullable: true })
  finishedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
