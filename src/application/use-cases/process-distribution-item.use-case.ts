import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { EntityId } from 'src/domain/common/entity-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { EventId } from 'src/domain/distribution/value-objects/event-id';

export class ProcessDistributionItemUseCase {
  constructor(
    private readonly runRepo: DistributionRunRepository,
    private readonly itemRepo: EventDistributionRepository,
  ) {}

  async execute(params: {
    runId: string;
    eventId: string;
    document: string;
    userId: string;
    biometricId: string;
  }): Promise<void> {
    const runId = EntityId.create(params.runId);
    const eventId = EventId.create(params.eventId);

    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error('distribution_run_not_found');

    const item = EventDistribution.create({
      distributionRunId: runId,
      eventId,
      document: params.document,
      userId: params.userId,
      biometricId: params.biometricId,
    });

    item.markSent();
    item.markProcessed();
    run.markDistributed();

    await this.itemRepo.save(item);
    await this.runRepo.save(run);
  }
}
