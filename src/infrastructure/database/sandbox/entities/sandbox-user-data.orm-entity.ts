import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('sandbox_user_data')
export class SandboxUserDataOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  document: string;

  @Index()
  @Column()
  token: string;

  @Index()
  @Column({ name: 'origin_company_id' })
  originCompanyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
