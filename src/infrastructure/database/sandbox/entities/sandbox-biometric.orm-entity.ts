import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('sandbox_biometric')
export class SandboxBiometricOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'origin_token' })
  originToken: string;

  @Column({ name: 'resized_image_url' })
  resizedImageUrl: string;

  @Index()
  @Column({ default: 'approved' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
