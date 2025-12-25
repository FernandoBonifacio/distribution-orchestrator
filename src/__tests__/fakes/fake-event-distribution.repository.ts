import { EntityId } from 'src/domain/common/entity-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { DistributionItemStatus } from 'src/domain/distribution/enums/distribution-item-status';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';

export class FakeEventDistributionRepository implements EventDistributionRepository {
  private items: EventDistribution[] = [];

  async save(item: EventDistribution): Promise<void> {
    this.items.push(item);
  }

  async saveMany(items: EventDistribution[]): Promise<void> {
    this.items.push(...items);
  }

  async findByRunId(runId: EntityId): Promise<EventDistribution[]> {
    return this.items.filter((i) => i['distributionRunId'].equals(runId));
  }

  async findByRunIdAndBiometricId(
    runId: EntityId,
    biometricId: string,
  ): Promise<EventDistribution | null> {
    const item = this.items.find(
      (i) => i['distributionRunId'].equals(runId) && i.getBiometricId() === biometricId,
    );

    return item ?? null;
  }

  async findFailedByRunId(runId: EntityId): Promise<EventDistribution[]> {
    return this.items.filter(
      (i) =>
        i['distributionRunId'].equals(runId) &&
        (i.getStatus() === 'FAILED' || i.getStatus() === 'ERROR'),
    );
  }

  async findEligibleByEvent(eventId: EventId): Promise<EventDistribution[]> {
    return this.items.filter(
      (item) =>
        item.getStatus() === DistributionItemStatus.PENDING && item.getEventId().equals(eventId),
    );
  }
}
