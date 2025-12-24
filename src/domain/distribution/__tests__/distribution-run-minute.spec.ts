import { EntityId } from 'src/domain/common/entity-id';
import { DistributionRunMinute } from '../entities/distribution-run-minute';

describe('DistributionRunMinute (Domain)', () => {
  it('should aggregate metrics correctly per minute', () => {
    const runId = EntityId.create();
    const minute = new Date();

    const m = DistributionRunMinute.create(runId, minute);

    m.incrementProcessed();
    m.incrementDistributed();

    m.incrementProcessed();
    m.incrementDuplicated();

    m.incrementProcessed();
    m.incrementFailed();

    const metrics = m.getMetrics();

    expect(metrics.processed).toBe(3);
    expect(metrics.distributed).toBe(1);
    expect(metrics.duplicated).toBe(1);
    expect(metrics.failed).toBe(1);
  });
});
