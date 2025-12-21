import { EntityId } from '../common/entity-id';
import { DistributionRun } from '../distribution/entities/distribution-run';
import { EventId } from '../distribution/value-objects/event-id';

export interface DistributionRunRepository {
  save(run: DistributionRun): Promise<void>;

  findById(id: EntityId): Promise<DistributionRun | null>;

  findActiveByEvent(eventId: EventId): Promise<DistributionRun | null>;
}
