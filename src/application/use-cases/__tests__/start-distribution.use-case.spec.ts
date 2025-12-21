import { FakeDistributionRunRepository } from 'src/__tests__/fakes/fake-distribution-run.repository';
import { StartDistributionUseCase } from '../start-distribution.use-case';

describe('StartDistributionUseCase', () => {
  it('should start a new distribution run', async () => {
    const repo = new FakeDistributionRunRepository();
    const useCase = new StartDistributionUseCase(repo);

    const run = await useCase.execute({
      tenantId: 'tenant-1',
      eventId: 'event-1',
      totalFound: 10,
      totalEligible: 8,
    });

    expect(run.getStatus()).toBe('RUNNING');
  });

  it('should not allow two active runs for same event', async () => {
    const repo = new FakeDistributionRunRepository();
    const useCase = new StartDistributionUseCase(repo);

    await useCase.execute({
      tenantId: 'tenant-1',
      eventId: 'event-1',
      totalFound: 10,
      totalEligible: 8,
    });

    await expect(
      useCase.execute({
        tenantId: 'tenant-1',
        eventId: 'event-1',
        totalFound: 5,
        totalEligible: 5,
      }),
    ).rejects.toThrow('distribution_already_running');
  });
});
