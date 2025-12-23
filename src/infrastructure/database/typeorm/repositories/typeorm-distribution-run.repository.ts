import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DistributionRunRepository } from '../../../../domain/repositories/distribution-run.repository';
import { DistributionRun } from '../../../../domain/distribution/entities/distribution-run';
import { EntityId } from '../../../../domain/common/entity-id';

import { DistributionRunOrmEntity } from '../entities/distribution-run.orm-entity';
import { DistributionRunMapper } from '../mappers/distribution-run.mapper';
import { EventId } from 'src/domain/distribution/value-objects/event-id';

@Injectable()
export class TypeOrmDistributionRunRepository implements DistributionRunRepository {
  constructor(
    @InjectRepository(DistributionRunOrmEntity)
    private readonly ormRepo: Repository<DistributionRunOrmEntity>,
  ) {}

  async save(run: DistributionRun): Promise<void> {
    const orm = DistributionRunMapper.toOrm(run);
    await this.ormRepo.save(orm);
  }

  async findById(id: EntityId): Promise<DistributionRun | null> {
    const orm = await this.ormRepo.findOne({
      where: { id: id.toString() },
    });

    if (!orm) return null;

    return DistributionRunMapper.toDomain(orm);
  }

  async findActiveByEvent(eventId: EventId): Promise<DistributionRun | null> {
    const orm = await this.ormRepo.findOne({
      where: {
        eventId: eventId.toString(),
        status: 'RUNNING',
      },
    });

    if (!orm) return null;

    return DistributionRunMapper.toDomain(orm);
  }
}
