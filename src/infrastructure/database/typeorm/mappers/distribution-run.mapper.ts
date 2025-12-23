import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { DistributionRunOrmEntity } from '../entities/distribution-run.orm-entity';
import { DistributionRunStatus } from 'src/domain/distribution/enums/distribution-run-status';

export class DistributionRunMapper {
  static toOrm(entity: DistributionRun): DistributionRunOrmEntity {
    const orm = new DistributionRunOrmEntity();

    orm.id = entity.getId().toString();
    orm.tenantId = entity['tenantId'].toString();
    orm.eventId = entity['eventId'].toString();
    orm.status = entity.getStatus();

    const metrics = entity.getMetrics();
    orm.totalFound = metrics.totalFound;
    orm.totalEligible = metrics.totalEligible;
    orm.totalDistributed = metrics.totalDistributed;
    orm.totalFailed = metrics.totalFailed;

    orm.createdAt = entity['createdAt'];
    orm.startedAt = entity['startedAt'];
    orm.finishedAt = entity['finishedAt'];

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
      totalDistributed: orm.totalDistributed,
      totalFailed: orm.totalFailed,
    });
  }
}
