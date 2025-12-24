import { Logger } from '@nestjs/common';

import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { SyncFinalRepository } from 'src/domain/distribution/repositories/sync-final.repository';
import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';

import { EntityId } from 'src/domain/common/entity-id';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';

export class ProcessDistributionItemUseCase {
  private readonly logger = new Logger(ProcessDistributionItemUseCase.name);

  constructor(
    private readonly runRepo: DistributionRunRepository,
    private readonly itemRepo: EventDistributionRepository,
    private readonly syncFinalRepo: SyncFinalRepository,
    private readonly runMinuteRepo: DistributionRunMinuteRepository,
  ) {}

  async execute(params: {
    runId: string;
    eventId: string;
    document: string;
    userId: string;
    biometricId: string;
    imageUrl: string;
  }): Promise<void> {
    const runId = EntityId.create(params.runId);
    const eventId = EventId.create(params.eventId);

    const run = await this.runRepo.findById(runId);
    if (!run) {
      throw new Error('distribution_run_not_found');
    }

    if (run.getStatus() !== 'RUNNING') {
      this.logger.warn(
        `Ignoring message because run is ${run.getStatus()} | runId=${run.getId().toString()}`,
      );
      return;
    }

    const minute = this.getMinute();

    const runMinute = await this.runMinuteRepo.findOrCreate(run.getId(), minute);

    const item = EventDistribution.create({
      distributionRunId: runId,
      eventId,
      document: params.document,
      userId: params.userId,
      biometricId: params.biometricId,
    });

    const result = await this.syncFinalRepo.insert({
      tenantId: run.getTenantId(),
      eventId,
      document: params.document,
      biometricId: params.biometricId,
      imageUrl: params.imageUrl,
      runId,
    });

    run.incrementProcessed();

    if (result.status === 'inserted') {
      item.markSent();
      item.markProcessed();
      run.incrementDistributed();
    } else {
      item.markSent();
      item.markProcessed();
      run.incrementDuplicated();
    }

    runMinute.incrementProcessed();

    if (result.status === 'inserted') {
      runMinute.incrementDistributed();
    } else {
      runMinute.incrementDuplicated();
    }

    await this.itemRepo.save(item);
    await this.runMinuteRepo.save(runMinute);

    const finished = run.finishIfCompleted();

    await this.runRepo.save(run);

    if (finished) {
      this.logger.log(
        `DistributionRun FINISHED | runId=${run.getId().toString()} | eventId=${eventId.toString()}`,
      );
    }
  }

  private getMinute(date = new Date()): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }
}
