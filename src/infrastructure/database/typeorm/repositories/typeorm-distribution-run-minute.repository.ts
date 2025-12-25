import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';
import { DistributionRunMinute } from 'src/domain/distribution/entities/distribution-run-minute';
import { EntityId } from 'src/domain/common/entity-id';

import { DistributionRunMinuteOrmEntity } from '../entities/distribution-run-minute.orm-entity';
import { DistributionRunMinuteMapper } from '../mappers/distribution-run-minute.mapper';

@Injectable()
export class TypeOrmDistributionRunMinuteRepository implements DistributionRunMinuteRepository {
  constructor(
    @InjectRepository(DistributionRunMinuteOrmEntity)
    private readonly ormRepo: Repository<DistributionRunMinuteOrmEntity>,
  ) {}

  async save(minute: DistributionRunMinute): Promise<void> {
    const orm = DistributionRunMinuteMapper.toOrm(minute);
    await this.ormRepo.save(orm);
  }

  async findOrCreate(runId: EntityId, minute: Date): Promise<DistributionRunMinute> {
    const orm = await this.ormRepo.findOne({
      where: {
        distributionRunId: runId.toString(),
        minute,
      },
    });

    if (orm) return DistributionRunMinuteMapper.toDomain(orm);

    const created = DistributionRunMinute.create(runId, minute);
    try {
      await this.save(created);
      return created;
    } catch (error: unknown) {
      const existing = await this.ormRepo.findOne({
        where: {
          distributionRunId: runId.toString(),
          minute,
        },
      });

      if (existing) return DistributionRunMinuteMapper.toDomain(existing);
      throw error;
    }
  }
}
