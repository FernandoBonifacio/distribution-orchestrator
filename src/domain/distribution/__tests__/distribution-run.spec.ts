import { DistributionRun } from '../entities/distribution-run';
import { DistributionRunStatus } from '../enums/distribution-run-status';
import { EventId } from '../value-objects/event-id';
import { TenantId } from '../value-objects/tenant-id';

describe('DistributionRun (Domain)', () => {
  const tenantId = TenantId.create('tenant-test');
  const eventId = EventId.create('event-test');

  it('should start in CREATED status', () => {
    const run = DistributionRun.create({ tenantId, eventId });

    expect(run.getStatus()).toBe(DistributionRunStatus.CREATED);
  });

  it('should start correctly and move to RUNNING', () => {
    const run = DistributionRun.create({ tenantId, eventId });

    run.start(10, 5);

    expect(run.getStatus()).toBe(DistributionRunStatus.RUNNING);
    expect(run.getMetrics().totalEligible).toBe(5);
  });

  it('should increment metrics correctly', () => {
    const run = DistributionRun.create({ tenantId, eventId });
    run.start(10, 3);

    run.incrementProcessed();
    run.incrementDistributed();

    run.incrementProcessed();
    run.incrementDuplicated();

    run.incrementProcessed();
    run.incrementFailed();

    const metrics = run.getMetrics();

    expect(metrics.totalProcessed).toBe(3);
    expect(metrics.totalDistributed).toBe(1);
    expect(metrics.totalDuplicated).toBe(1);
    expect(metrics.totalFailed).toBe(1);
  });

  it('should NOT finish before all items are processed', () => {
    const run = DistributionRun.create({ tenantId, eventId });
    run.start(10, 3);

    run.incrementProcessed();
    run.incrementDistributed();

    const finished = run.finishIfCompleted();

    expect(finished).toBe(false);
    expect(run.getStatus()).toBe(DistributionRunStatus.RUNNING);
  });

  it('should finish automatically when all eligible items are processed', () => {
    const run = DistributionRun.create({ tenantId, eventId });
    run.start(10, 2);

    run.incrementProcessed();
    run.incrementDistributed();

    run.incrementProcessed();
    run.incrementDuplicated();

    const finished = run.finishIfCompleted();

    expect(finished).toBe(true);
    expect(run.getStatus()).toBe(DistributionRunStatus.FINISHED);
  });

  it('should not allow finishing twice', () => {
    const run = DistributionRun.create({ tenantId, eventId });
    run.start(10, 1);

    run.incrementProcessed();
    run.incrementDistributed();
    run.finishIfCompleted();

    expect(() => run.finish()).toThrow();
  });
});
