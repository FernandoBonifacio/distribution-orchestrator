import { ProcessDistributionItemUseCase } from '../process-distribution-item.use-case';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { DistributionRunStatus } from 'src/domain/distribution/enums/distribution-run-status';
import { DistributionRunMinute } from 'src/domain/distribution/entities/distribution-run-minute';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { SyncFinalRepository } from 'src/domain/distribution/repositories/sync-final.repository';
import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';

describe('ProcessDistributionItemUseCase', () => {
  const runRepo: jest.Mocked<DistributionRunRepository> = {
    findById: jest.fn(),
    save: jest.fn(),
    findActiveByEvent: jest.fn(),
    incrementMetrics: jest.fn(),
  };

  const itemRepo: jest.Mocked<EventDistributionRepository> = {
    save: jest.fn(),
    saveMany: jest.fn(),
    findByRunId: jest.fn(),
    findByRunIdAndBiometricId: jest.fn(),
    findFailedByRunId: jest.fn(),
    findEligibleByEvent: jest.fn(),
  };

  const syncFinalRepo: jest.Mocked<SyncFinalRepository> = {
    insert: jest.fn(),
  };

  const runMinuteRepo: jest.Mocked<DistributionRunMinuteRepository> = {
    findOrCreate: jest.fn(),
    save: jest.fn(),
    incrementMetrics: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    itemRepo.findByRunIdAndBiometricId.mockResolvedValue(null);
  });

  it('should process an item successfully and update metrics', async () => {
    const run = DistributionRun.create({
      tenantId: TenantId.create('tenant-1'),
      eventId: EventId.create('event-1'),
    });

    run.start(1, 1);

    runRepo.findById.mockResolvedValue(run);
    runRepo.incrementMetrics.mockImplementation(async (_id, deltas) => {
      if (deltas.processed) run.incrementProcessed();
      if (deltas.distributed) run.incrementDistributed();
      if (deltas.failed) run.incrementFailed();
      if (deltas.duplicated) run.incrementDuplicated();
      return run;
    });

    runMinuteRepo.findOrCreate.mockResolvedValue(
      DistributionRunMinute.create(run.getId(), new Date()),
    );
    runMinuteRepo.incrementMetrics.mockResolvedValue(
      DistributionRunMinute.create(run.getId(), new Date()),
    );

    syncFinalRepo.insert.mockResolvedValue({ status: 'inserted' });

    const useCase = new ProcessDistributionItemUseCase(
      runRepo,
      itemRepo,
      syncFinalRepo,
      runMinuteRepo,
    );

    await useCase.execute({
      runId: run.getId().toString(),
      eventId: 'event-1',
      document: '123',
      userId: '123',
      biometricId: 'bio-1',
      imageUrl: 'http://image',
    });

    expect(itemRepo.save).toHaveBeenCalled();
    expect(syncFinalRepo.insert).toHaveBeenCalled();
    expect(runRepo.save).toHaveBeenCalled();
  });

  it('should finish the run when last item is processed', async () => {
    const run = DistributionRun.create({
      tenantId: TenantId.create('tenant-1'),
      eventId: EventId.create('event-1'),
    });

    run.start(1, 1);

    runRepo.findById.mockResolvedValue(run);
    runRepo.incrementMetrics.mockImplementation(async (_id, deltas) => {
      if (deltas.processed) run.incrementProcessed();
      if (deltas.distributed) run.incrementDistributed();
      if (deltas.failed) run.incrementFailed();
      if (deltas.duplicated) run.incrementDuplicated();
      return run;
    });

    runMinuteRepo.findOrCreate.mockResolvedValue(
      DistributionRunMinute.create(run.getId(), new Date()),
    );
    runMinuteRepo.incrementMetrics.mockResolvedValue(
      DistributionRunMinute.create(run.getId(), new Date()),
    );

    syncFinalRepo.insert.mockResolvedValue({ status: 'inserted' });

    const useCase = new ProcessDistributionItemUseCase(
      runRepo,
      itemRepo,
      syncFinalRepo,
      runMinuteRepo,
    );

    await useCase.execute({
      runId: run.getId().toString(),
      eventId: 'event-1',
      document: '123',
      userId: '123',
      biometricId: 'bio-1',
      imageUrl: 'http://image',
    });

    expect(run.getStatus()).toBe(DistributionRunStatus.FINISHED);
  });
});
