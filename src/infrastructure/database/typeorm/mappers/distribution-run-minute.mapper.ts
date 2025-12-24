import { DistributionRunMinute } from 'src/domain/distribution/entities/distribution-run-minute';
import { DistributionRunMinuteOrmEntity } from '../entities/distribution-run-minute.orm-entity';

export class DistributionRunMinuteMapper {
  static toOrm(entity: DistributionRunMinute): DistributionRunMinuteOrmEntity {
    const orm = new DistributionRunMinuteOrmEntity();

    orm.id = entity.getId().toString();
    orm.distributionRunId = entity.getRunId().toString();
    orm.minute = entity.getMinute();

    const metrics = entity.getMetrics();
    orm.processed = metrics.processed;
    orm.distributed = metrics.distributed;
    orm.failed = metrics.failed;
    orm.duplicated = metrics.duplicated;

    return orm;
  }

  static toDomain(orm: DistributionRunMinuteOrmEntity): DistributionRunMinute {
    return DistributionRunMinute.rehydrate({
      id: orm.id,
      runId: orm.distributionRunId,
      minute: orm.minute,
      processed: orm.processed,
      distributed: orm.distributed,
      failed: orm.failed,
      duplicated: orm.duplicated,
    });
  }
}
