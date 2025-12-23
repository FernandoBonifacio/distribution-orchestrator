import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventDistributionRepository } from '../../../../domain/repositories/event-distribution.repository';
import { EventDistribution } from '../../../../domain/distribution/entities/event-distribution';
import { EntityId } from '../../../../domain/common/entity-id';
import { EventId } from '../../../../domain/distribution/value-objects/event-id';
import { DistributionItemStatus } from '../../../../domain/distribution/enums/distribution-item-status';

import { EventDistributionOrmEntity } from '../entities/event-distribution.orm-entity';
import { EventDistributionMapper } from '../mappers/event-distribution.mapper';

@Injectable()
export class TypeOrmEventDistributionRepository implements EventDistributionRepository {
  constructor(
    @InjectRepository(EventDistributionOrmEntity)
    private readonly ormRepo: Repository<EventDistributionOrmEntity>,
  ) {}

  async save(item: EventDistribution): Promise<void> {
    const orm = EventDistributionMapper.toOrm(item);
    await this.ormRepo.save(orm);
  }

  async saveMany(items: EventDistribution[]): Promise<void> {
    const orms = items.map(EventDistributionMapper.toOrm);
    await this.ormRepo.save(orms);
  }

  async findByRunId(runId: EntityId): Promise<EventDistribution[]> {
    const rows = await this.ormRepo.find({
      where: { distributionRunId: runId.toString() },
    });

    return rows.map(EventDistributionMapper.toDomain);
  }

  async findFailedByRunId(runId: EntityId): Promise<EventDistribution[]> {
    const rows = await this.ormRepo.find({
      where: {
        distributionRunId: runId.toString(),
        status: DistributionItemStatus.FAILED,
      },
    });

    return rows.map(EventDistributionMapper.toDomain);
  }

  async findEligibleByEvent(eventId: EventId): Promise<EventDistribution[]> {
    const rows = await this.ormRepo.find({
      where: {
        eventId: eventId.toString(),
        status: DistributionItemStatus.PENDING,
      },
    });

    return rows.map(EventDistributionMapper.toDomain);
  }
}
