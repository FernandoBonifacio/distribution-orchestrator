import { EntityId } from 'src/domain/common/entity-id';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';
import { DistributionRunMinute } from 'src/domain/distribution/entities/distribution-run-minute';

export class ProcessDistributionItemUseCase {
  constructor(
    private readonly runRepository: DistributionRunRepository,
    private readonly itemRepository: EventDistributionRepository,
    private readonly minuteRepository: DistributionRunMinuteRepository,
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

    const minuteIndex = Math.floor((Date.now() - run.getStarteAt().getTime()) / 60000);

    let minute = await this.minuteRepository.findOpenByRunAndMinute(runId, minuteIndex);

    if (!minute) {
      minute = DistributionRunMinute.start({
        runId,
        minute: minuteIndex,
      });
    }

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
    await this.minuteRepository.save(minute);
    await this.runRepository.save(run);
  }
}
