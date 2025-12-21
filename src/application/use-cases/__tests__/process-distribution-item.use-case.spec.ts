import { FakeDistributionRunRepository } from 'src/__tests__/fakes/fake-distribution-run.repository';
import { FakeEventDistributionRepository } from 'src/__tests__/fakes/fake-event-distribution.repository';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { ProcessDistributionItemUseCase } from '../process-distribution-item.use-case';

describe('ProcessDistributionItemUseCase', () => {
  it('should process a successful distribution item', async () => {
    const runRepo = new FakeDistributionRunRepository();
    const itemRepo = new FakeEventDistributionRepository();

    const run = DistributionRun.create({
      tenantId: TenantId.create('tenant-1'),
      eventId: EventId.create('event-1'),
    });

    run.start(1, 1);
    await runRepo.save(run);

    const useCase = new ProcessDistributionItemUseCase(runRepo, itemRepo);

    await useCase.execute({
      runId: run.getId().toString(),
      document: '123',
      userId: 'user-1',
      biometricId: 'bio-1',
      success: true,
    });

    expect(run.getMetrics().totalDistributed).toBe(1);
  });
});
