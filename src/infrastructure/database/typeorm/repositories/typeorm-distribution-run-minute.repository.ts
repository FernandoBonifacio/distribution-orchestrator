import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';
import { DistributionRunMinute } from 'src/domain/distribution/entities/distribution-run-minute';
import { EntityId } from 'src/domain/common/entity-id';

import { DistributionRunMinuteOrmEntity } from '../entities/distribution-run-minute.orm-entity';
import { DistributionRunMinuteMapper } from '../mappers/istribution-run-minute.mapper';

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

  async findOpenByRunAndMinute(
    runId: EntityId,
    minute: number,
  ): Promise<DistributionRunMinute | null> {
    const orm = await this.ormRepo.findOne({
      where: {
        distributionRunId: runId.toString(),
        minute,
        finishedAt: IsNull(),
      },
    });

    if (!orm) return null;

    return DistributionRunMinuteMapper.toDomain(orm);
  }
}
