import { Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

export class DistributionRunMinuteOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'distribution_run_id', type: 'uuid' })
  distributionRunId: string;

  @Column({ type: 'int' })
  minute: number;

  @Column({ name: 'total_received', type: 'int', default: 0 })
  totalReceived: number;

  @Column({ name: 'total_sucess', type: 'int', default: 0 })
  totalSuccess: number;

  @Column({ name: 'total_failed', type: 'int', default: 0 })
  totalFailed: number;

  @Column({ name: 'start_failed', type: 'int' })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
