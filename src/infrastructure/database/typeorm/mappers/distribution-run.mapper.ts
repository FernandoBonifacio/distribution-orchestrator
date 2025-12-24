import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { DistributionRunStatus } from 'src/domain/distribution/enums/distribution-run-status';
import { DistributionRunOrmEntity } from '../entities/distribution-run.orm-entity';

export class DistributionRunMapper {
  static toOrm(entity: DistributionRun): DistributionRunOrmEntity {
    const orm = new DistributionRunOrmEntity();

    orm.id = entity.getId().toString();
    orm.tenantId = entity.getTenantId().toString();
    orm.eventId = entity.getEventId().toString();
    orm.status = entity.getStatus();

    const metrics = entity.getMetrics();
    orm.totalFound = metrics.totalFound;
    orm.totalEligible = metrics.totalEligible;
    orm.totalProcessed = metrics.totalProcessed;
    orm.totalDistributed = metrics.totalDistributed;
    orm.totalFailed = metrics.totalFailed;
    orm.totalDuplicated = metrics.totalDuplicated;

    orm.createdAt = entity.getCreatedAt();
    orm.startedAt = entity.getStartedAt();
    orm.finishedAt = entity.getFinishedAt();

    return orm;
  }

  static toDomain(orm: DistributionRunOrmEntity): DistributionRun {
    return DistributionRun.rehydrate({
      id: orm.id,
      tenantId: orm.tenantId,
      eventId: orm.eventId,
      status: orm.status as DistributionRunStatus,
      createdAt: orm.createdAt,
      startedAt: orm.startedAt,
      finishedAt: orm.finishedAt,
      totalFound: orm.totalFound,
      totalEligible: orm.totalEligible,
      totalProcessed: orm.totalProcessed,
      totalDistributed: orm.totalDistributed,
      totalFailed: orm.totalFailed,
      totalDuplicated: orm.totalDuplicated,
    });
  }
}
