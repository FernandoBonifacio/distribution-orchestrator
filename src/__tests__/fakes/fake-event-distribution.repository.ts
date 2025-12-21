import { EntityId } from 'src/domain/common/entity-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
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

  async findFailedByRunId(runId: EntityId): Promise<EventDistribution[]> {
    return this.items.filter(
      (i) => i['distributionRunId'].equals(runId) && i.getStatus() === 'FAILED',
    );
  }
}
