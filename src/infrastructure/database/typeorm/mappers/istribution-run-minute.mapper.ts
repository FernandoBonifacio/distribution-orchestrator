import { DistributionRunMinute } from 'src/domain/distribution/entities/distribution-run-minute';
import { DistributionRunMinuteOrmEntity } from '../entities/distribution-run-minute.orm-entity';

export class DistributionRunMinuteMapper {
  static toOrm(entity: DistributionRunMinute): DistributionRunMinuteOrmEntity {
    const orm = new DistributionRunMinuteOrmEntity();

    orm.id = entity['id'].toString();
    orm.distributionRunId = entity['runId'].toString();
    orm.minute = entity['minute'];

    orm.totalReceived = entity['totalReceived'];
    orm.totalSuccess = entity['totalSuccess'];
    orm.totalFailed = entity['totalFailed'];

    orm.startedAt = entity['startedAt'];
    orm.finishedAt = entity['finishedAt'];

    return orm;
  }

  static toDomain(orm: DistributionRunMinuteOrmEntity): DistributionRunMinute {
    return DistributionRunMinute.rehydrate({
      id: orm.id,
      runId: orm.distributionRunId,
      minute: orm.minute,
      startedAt: orm.startedAt,
      totalReceived: orm.totalReceived,
      totalSuccess: orm.totalSuccess,
      totalFailed: orm.totalFailed,
      finishedAt: orm.finishedAt,
    });
  }
}
