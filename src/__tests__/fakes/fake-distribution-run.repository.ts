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
}
