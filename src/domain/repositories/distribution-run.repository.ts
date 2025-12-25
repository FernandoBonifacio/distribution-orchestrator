import { DistributionRun } from '../distribution/entities/distribution-run';
import { EntityId } from '../common/entity-id';
import { EventId } from '../distribution/value-objects/event-id';

export abstract class DistributionRunRepository {
  abstract save(run: DistributionRun): Promise<void>;

  abstract findById(id: EntityId): Promise<DistributionRun | null>;

  abstract findActiveByEvent(eventId: EventId): Promise<DistributionRun | null>;

  abstract incrementMetrics(
    id: EntityId,
    deltas: {
      processed?: number;
      distributed?: number;
      failed?: number;
      duplicated?: number;
    },
  ): Promise<DistributionRun>;
}
