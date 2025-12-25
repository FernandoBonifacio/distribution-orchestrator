import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DistributionRunRepository } from '../../../../domain/repositories/distribution-run.repository';
import { DistributionRun } from '../../../../domain/distribution/entities/distribution-run';
import { EntityId } from '../../../../domain/common/entity-id';

import { DistributionRunMapper } from '../mappers/distribution-run.mapper';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { DistributionRunOrmEntity } from '../entities/distribution-run.orm-entity';

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

  async incrementMetrics(
    id: EntityId,
    deltas: {
      processed?: number;
      distributed?: number;
      failed?: number;
      duplicated?: number;
    },
  ): Promise<DistributionRun> {
    const set: Record<string, () => string> = {};

    if (deltas.processed) {
      set.totalProcessed = () => `"total_processed" + ${deltas.processed}`;
    }
    if (deltas.distributed) {
      set.totalDistributed = () => `"total_distributed" + ${deltas.distributed}`;
    }
    if (deltas.failed) {
      set.totalFailed = () => `"total_failed" + ${deltas.failed}`;
    }
    if (deltas.duplicated) {
      set.totalDuplicated = () => `"total_duplicated" + ${deltas.duplicated}`;
    }

    await this.ormRepo
      .createQueryBuilder()
      .update(DistributionRunOrmEntity)
      .set(set as Record<string, () => string>)
      .where('id = :id', { id: id.toString() })
      .execute();

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('distribution_run_not_found');
    }

    return updated;
  }
}
