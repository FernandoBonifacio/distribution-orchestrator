import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { EventDistributionOrmEntity } from '../entities/event-distribution.orm-entity';
import { DistributionItemStatus } from 'src/domain/distribution/enums/distribution-item-status';

export class EventDistributionMapper {
  static toOrm(entity: EventDistribution): EventDistributionOrmEntity {
    const orm = new EventDistributionOrmEntity();

    orm.id = entity.getId().toString();
    orm.distributionRunId = entity.getDistributionRunId().toString();
    orm.eventId = entity.getEventId().toString();

    orm.document = entity.getDocument();

    orm.userId = entity.getUserId();
    orm.biometricId = entity.getBiometricId();

    orm.status = entity.getStatus();

    orm.createdAt = entity.getCreatedAt();
    orm.processedAt = entity.getProcessedAt();
    orm.errorMessage = entity.getErrorMessage();

    return orm;
  }

  static toDomain(orm: EventDistributionOrmEntity): EventDistribution {
    return EventDistribution.rehydrate({
      id: orm.id,
      distributionRunId: orm.distributionRunId,
      eventId: orm.eventId,

      document: orm.document,

      userId: orm.userId,
      biometricId: orm.biometricId,

      status: orm.status as DistributionItemStatus,
      createdAt: orm.createdAt,
      processedAt: orm.processedAt ?? undefined,
      errorMessage: orm.errorMessage ?? undefined,
    });
  }
}
