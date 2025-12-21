import { EntityId } from '../../common/entity-id';
import { assert } from '../../common/assert';
import { DistributionRunStatus } from '../enums/distribution-run-status';
import { TenantId } from '../value-objects/tenant-id';
import { EventId } from '../value-objects/event-id';

export class DistributionRun {
  private status: DistributionRunStatus;
  private readonly createdAt: Date;
  private startedAt?: Date;
  private finishedAt?: Date;

  private totalFound = 0;
  private totalEligible = 0;
  private totalDistributed = 0;
  private totalFailed = 0;

  private constructor(
    private readonly id: EntityId,
    private readonly tenantId: TenantId,
    private readonly eventId: EventId,
  ) {
    this.status = DistributionRunStatus.CREATED;
    this.createdAt = new Date();
  }

  static create(params: { tenantId: TenantId; eventId: EventId }): DistributionRun {
    return new DistributionRun(EntityId.create(), params.tenantId, params.eventId);
  }

  start(totalFound: number, totalEligible: number): void {
    assert(this.status === DistributionRunStatus.CREATED, 'distribution_not_created');
    assert(totalFound >= 0, 'total_found_invalid');
    assert(totalEligible >= 0, 'total_eligible_invalid');

    this.totalFound = totalFound;
    this.totalEligible = totalEligible;
    this.startedAt = new Date();
    this.status = DistributionRunStatus.RUNNING;
  }

  markDistributed(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.totalDistributed += 1;
  }

  markFailed(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.totalFailed += 1;
  }

  finish(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.finishedAt = new Date();
    this.status = DistributionRunStatus.FINISHED;
  }

  cancel(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.finishedAt = new Date();
    this.status = DistributionRunStatus.CANCELLED;
  }

  fail(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.finishedAt = new Date();
    this.status = DistributionRunStatus.FAILED;
  }

  getId(): EntityId {
    return this.id;
  }

  getStatus(): DistributionRunStatus {
    return this.status;
  }

  getMetrics() {
    return {
      totalFound: this.totalFound,
      totalEligible: this.totalEligible,
      totalDistributed: this.totalDistributed,
      totalFailed: this.totalFailed,
    };
  }
}
