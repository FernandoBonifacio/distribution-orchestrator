import { EntityId } from 'src/domain/common/entity-id';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';

export class FakeDistributionRunRepository implements DistributionRunRepository {
  private runs: DistributionRun[] = [];
  async save(run: DistributionRun): Promise<void> {
    const index = this.runs.findIndex((r) => r.getId().equals(run.getId()));

    if (index >= 0) {
      this.runs[index] = run;
    } else {
      this.runs.push(run);
    }
  }

  async findById(id: EntityId): Promise<DistributionRun | null> {
    return this.runs.find((r) => r.getId().equals(id)) ?? null;
  }

  async findActiveByEvent(eventId: EventId): Promise<DistributionRun | null> {
    return (
      this.runs.find(
        (r) => r.getStatus() === 'RUNNING' && r['eventId'].toString() === eventId.toString(),
      ) ?? null
    );
  }

  async incrementMetrics(
    id: EntityId,
    deltas: {
      processed?: number;
      distributed?: number;
      failed?: number;
      duplicated?: number;
    },
  ): Promise<DistributionRun> {
    const run = await this.findById(id);
    if (!run) throw new Error('distribution_run_not_found');

    if (deltas.processed) {
      for (let i = 0; i < deltas.processed; i += 1) run.incrementProcessed();
    }
    if (deltas.distributed) {
      for (let i = 0; i < deltas.distributed; i += 1) run.incrementDistributed();
    }
    if (deltas.failed) {
      for (let i = 0; i < deltas.failed; i += 1) run.incrementFailed();
    }
    if (deltas.duplicated) {
      for (let i = 0; i < deltas.duplicated; i += 1) run.incrementDuplicated();
    }

    await this.save(run);
    return run;
  }
}
