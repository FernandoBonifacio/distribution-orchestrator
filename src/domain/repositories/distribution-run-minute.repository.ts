import { EntityId } from '../common/entity-id';
import { DistributionRunMinute } from '../distribution/entities/distribution-run-minute';

export abstract class DistributionRunMinuteRepository {
  abstract findOrCreate(runId: EntityId, minute: Date): Promise<DistributionRunMinute>;

  abstract save(entity: DistributionRunMinute): Promise<void>;

  abstract incrementMetrics(
    runId: EntityId,
    minute: Date,
    deltas: {
      processed?: number;
      distributed?: number;
      failed?: number;
      duplicated?: number;
    },
  ): Promise<DistributionRunMinute>;
}
