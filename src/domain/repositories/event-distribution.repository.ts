import { EntityId } from '../common/entity-id';
import { EventDistribution } from '../distribution/entities/event-distribution';

export interface EventDistributionRepository {
  save(item: EventDistribution): Promise<void>;

  saveMany(items: EventDistribution[]): Promise<void>;

  findByRunId(runId: EntityId): Promise<EventDistribution[]>;

  findFailedByRunId(runId: EntityId): Promise<EventDistribution[]>;
}
