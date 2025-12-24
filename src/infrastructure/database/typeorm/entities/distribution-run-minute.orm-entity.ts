import { Entity, PrimaryColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity({ name: 'distribution_run_minute' })
@Unique(['distributionRunId', 'minute'])
export class DistributionRunMinuteOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'distribution_run_id', type: 'uuid' })
  distributionRunId!: string;

  @Column({ type: 'timestamptz' })
  minute!: Date;

  @Column({ type: 'int', default: 0 })
  processed!: number;

  @Column({ type: 'int', default: 0 })
  distributed!: number;

  @Column({ type: 'int', default: 0 })
  failed!: number;

  @Column({ type: 'int', default: 0 })
  duplicated!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
