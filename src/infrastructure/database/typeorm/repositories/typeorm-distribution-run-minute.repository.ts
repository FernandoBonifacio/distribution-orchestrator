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

  async incrementMetrics(
    runId: EntityId,
    minute: Date,
    deltas: {
      processed?: number;
      distributed?: number;
      failed?: number;
      duplicated?: number;
    },
  ): Promise<DistributionRunMinute> {
    await this.findOrCreate(runId, minute);

    const set: Record<string, () => string> = {};

    if (deltas.processed) {
      set.processed = () => `"processed" + ${deltas.processed}`;
    }
    if (deltas.distributed) {
      set.distributed = () => `"distributed" + ${deltas.distributed}`;
    }
    if (deltas.failed) {
      set.failed = () => `"failed" + ${deltas.failed}`;
    }
    if (deltas.duplicated) {
      set.duplicated = () => `"duplicated" + ${deltas.duplicated}`;
    }

    await this.ormRepo
      .createQueryBuilder()
      .update(DistributionRunMinuteOrmEntity)
      .set(set as Record<string, () => string>)
      .where('distribution_run_id = :runId AND minute = :minute', {
        runId: runId.toString(),
        minute,
      })
      .execute();

    const updated = await this.ormRepo.findOne({
      where: { distributionRunId: runId.toString(), minute },
    });

    if (!updated) {
      throw new Error('distribution_run_minute_not_found');
    }

    return DistributionRunMinuteMapper.toDomain(updated);
  }
}
