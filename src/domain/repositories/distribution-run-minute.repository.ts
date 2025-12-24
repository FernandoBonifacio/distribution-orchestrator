import { EntityId } from '../common/entity-id';
import { DistributionRunMinute } from '../distribution/entities/distribution-run-minute';

export abstract class DistributionRunMinuteRepository {
  abstract save(minute: DistributionRunMinute): Promise<void>;

  abstract findOpenByRunAndMinute(
    rundId: EntityId,
    minute: number,
  ): Promise<DistributionRunMinute | null>;
}
