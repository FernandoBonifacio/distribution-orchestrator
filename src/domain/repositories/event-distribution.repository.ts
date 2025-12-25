import { EventDistribution } from '../distribution/entities/event-distribution';
import { EntityId } from '../common/entity-id';
import { EventId } from '../distribution/value-objects/event-id';

export abstract class EventDistributionRepository {
  abstract save(item: EventDistribution): Promise<void>;

  abstract saveMany(items: EventDistribution[]): Promise<void>;

  abstract findByRunId(runId: EntityId): Promise<EventDistribution[]>;

  abstract findByRunIdAndBiometricId(
    runId: EntityId,
    biometricId: string,
  ): Promise<EventDistribution | null>;

  abstract findFailedByRunId(runId: EntityId): Promise<EventDistribution[]>;

  abstract findEligibleByEvent(eventId: EventId): Promise<EventDistribution[]>;
}
