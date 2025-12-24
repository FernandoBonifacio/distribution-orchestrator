import { EntityId } from 'src/domain/common/entity-id';
import { assert } from 'src/domain/common/assert';

export class DistributionRunMinute {
  private totalReceived = 0;
  private totalSuccess = 0;
  private totalFailed = 0;
  private finishedAt?: Date;

  private constructor(
    private readonly id: EntityId,
    private readonly runId: EntityId,
    private readonly minute: number,
    private readonly startedAt: Date,
  ) {}

  static start(params: { runId: EntityId; minute: number }): DistributionRunMinute {
    assert(params.minute >= 0, 'invalid_minute');

    return new DistributionRunMinute(EntityId.create(), params.runId, params.minute, new Date());
  }

  static rehydrate(params: {
    id: string;
    runId: string;
    minute: number;
    startedAt: Date;
    totalReceived: number;
    totalSuccess: number;
    totalFailed: number;
    finishedAt?: Date;
  }): DistributionRunMinute {
    const minute = new DistributionRunMinute(
      EntityId.create(params.id),
      EntityId.create(params.runId),
      params.minute,
      params.startedAt,
    );

    minute.totalReceived = params.totalReceived;
    minute.totalSuccess = params.totalSuccess;
    minute.totalFailed = params.totalFailed;
    minute.finishedAt = params.finishedAt;

    return minute;
  }

  recordSuccess() {
    this.totalReceived++;
    this.totalSuccess++;
  }

  recordFailure() {
    this.totalReceived++;
    this.totalFailed++;
  }

  finish() {
    this.finishedAt = new Date();
  }
}
