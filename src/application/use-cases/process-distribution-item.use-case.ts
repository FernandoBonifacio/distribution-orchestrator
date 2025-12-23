import { EntityId } from 'src/domain/common/entity-id';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';

export class ProcessDistributionItemUseCase {
  constructor(
    private readonly runRepository: DistributionRunRepository,
    private readonly itemRepository: EventDistributionRepository,
  ) {}

  async execute(params: {
    runId: string;
    eventId: string;
    document: string;
    userId: string;
    biometricId: string;
    success: boolean;
    error?: string;
  }): Promise<void> {
    const runId = EntityId.create(params.runId);
    const eventId = EventId.create(params.eventId);

    const run = await this.runRepository.findById(runId);
    if (!run) throw new Error('distribution_run_not_found');

    const item = EventDistribution.create({
      distributionRunId: runId,
      eventId,
      document: params.document,
      userId: params.userId,
      biometricId: params.biometricId,
    });

    item.markSent();

    if (params.success) {
      item.markProcessed();
      run.markDistributed();
    } else {
      item.markFailed(params.error ?? 'unknown_error');
      run.markFailed();
    }

    await this.itemRepository.save(item);
    await this.runRepository.save(run);
  }
}
