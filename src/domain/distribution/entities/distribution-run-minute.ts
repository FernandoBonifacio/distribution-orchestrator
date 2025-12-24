import { EntityId } from '../../common/entity-id';

export class DistributionRunMinute {
  private processed = 0;
  private distributed = 0;
  private failed = 0;
  private duplicated = 0;

  private constructor(
    private readonly id: EntityId,
    private readonly runId: EntityId,
    private readonly minute: Date,
  ) {}

  static create(runId: EntityId, minute: Date): DistributionRunMinute {
    return new DistributionRunMinute(EntityId.create(), runId, minute);
  }

  static rehydrate(params: {
    id: string;
    runId: string;
    minute: Date;
    processed: number;
    distributed: number;
    failed: number;
    duplicated: number;
  }): DistributionRunMinute {
    const m = new DistributionRunMinute(
      EntityId.create(params.id),
      EntityId.create(params.runId),
      params.minute,
    );

    m.processed = params.processed;
    m.distributed = params.distributed;
    m.failed = params.failed;
    m.duplicated = params.duplicated;

    return m;
  }

  incrementProcessed(): void {
    this.processed += 1;
  }

  incrementDistributed(): void {
    this.distributed += 1;
  }

  incrementFailed(): void {
    this.failed += 1;
  }

  incrementDuplicated(): void {
    this.duplicated += 1;
  }

  getId(): EntityId {
    return this.id;
  }

  getRunId(): EntityId {
    return this.runId;
  }

  getMinute(): Date {
    return this.minute;
  }

  getMetrics() {
    return {
      processed: this.processed,
      distributed: this.distributed,
      failed: this.failed,
      duplicated: this.duplicated,
    };
  }
}
