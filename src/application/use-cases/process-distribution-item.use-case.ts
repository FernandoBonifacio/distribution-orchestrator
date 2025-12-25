import { Injectable, Logger } from '@nestjs/common';

import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { SyncFinalRepository } from 'src/domain/distribution/repositories/sync-final.repository';
import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';

import { EntityId } from 'src/domain/common/entity-id';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { DistributionRunStatus } from 'src/domain/distribution/enums/distribution-run-status';
import { DistributionItemStatus } from 'src/domain/distribution/enums/distribution-item-status';

@Injectable()
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
    // 🔒 NORMALIZAÇÃO / BLINDAGEM (aqui o erro explode cedo)
    const runId = EntityId.create(params.runId);
    const eventId = EventId.create(params.eventId);
    const userId = params.userId;
    const biometricId = params.biometricId;

    const run = await this.runRepo.findById(runId);
    if (!run) {
      throw new Error('distribution_run_not_found');
    }

    const minute = this.getMinute();
    await this.runMinuteRepo.findOrCreate(run.getId(), minute);

    const existingItem = await this.itemRepo.findByRunIdAndBiometricId(runId, biometricId);
    if (
      run.getStatus() !== DistributionRunStatus.RUNNING &&
      (!existingItem ||
        (existingItem.getStatus() !== DistributionItemStatus.PENDING &&
          existingItem.getStatus() !== DistributionItemStatus.SENT))
    ) {
      this.logger.warn(
        `Ignoring message because run is ${run.getStatus()} | runId=${run.getId().toString()}`,
      );
      return;
    }

    if (existingItem) {
      const status = existingItem.getStatus();
      if (
        status === DistributionItemStatus.PROCESSED ||
        status === DistributionItemStatus.FINISHED ||
        status === DistributionItemStatus.FAILED ||
        status === DistributionItemStatus.ERROR
      ) {
        this.logger.log(
          `Skipping already processed item | runId=${run.getId().toString()} | biometricId=${biometricId} | status=${status}`,
        );
        return;
      }
    }

    const item =
      existingItem ??
      EventDistribution.create({
        distributionRunId: runId,
        eventId,
        document: params.document,
        userId,
        biometricId,
      });

    try {
      const result = await this.syncFinalRepo.insert({
        tenantId: run.getTenantId(),
        eventId,
        document: params.document,
        biometricId,
        imageUrl: params.imageUrl,
        runId,
      });

      if (item.getStatus() === DistributionItemStatus.PENDING) {
        item.markSent();
      }

      const metricsDelta = {
        processed: 1,
        distributed: result.status === 'inserted' ? 1 : 0,
        duplicated: result.status === 'already_exists' ? 1 : 0,
      };

      const runAfter = await this.runRepo.incrementMetrics(runId, metricsDelta);
      await this.runMinuteRepo.incrementMetrics(runId, minute, metricsDelta);

      item.markProcessed();
      await this.itemRepo.save(item);

      const finished = runAfter.finishIfCompleted();
      if (finished) {
        await this.runRepo.save(runAfter);
        this.logger.log(
          `DistributionRun FINISHED | runId=${runAfter.getId().toString()} | eventId=${eventId.toString()}`,
        );
      }

      const metrics = runAfter.getMetrics();
      this.logger.log(
        `Item processed | runId=${runAfter.getId().toString()} | eventId=${eventId.toString()} | biometricId=${biometricId} | result=${result.status} | processed=${metrics.totalProcessed} | distributed=${metrics.totalDistributed} | duplicated=${metrics.totalDuplicated} | failed=${metrics.totalFailed}`,
      );
    } catch (error: unknown) {
      if (item.getStatus() === DistributionItemStatus.PENDING) {
        item.markSent();
      }
      item.markFailed(error instanceof Error ? error.message : 'unknown_error');
      const runAfter = await this.runRepo.incrementMetrics(runId, { processed: 1, failed: 1 });
      await this.runMinuteRepo.incrementMetrics(runId, minute, { processed: 1, failed: 1 });

      await this.itemRepo.save(item);

      this.logger.error(
        `Item failed | runId=${runAfter.getId().toString()} | eventId=${eventId.toString()} | biometricId=${biometricId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private getMinute(date = new Date()): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }
}
