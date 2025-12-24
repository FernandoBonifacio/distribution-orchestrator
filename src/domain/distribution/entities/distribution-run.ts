import { EntityId } from '../../common/entity-id';
import { assert } from '../../common/assert';
import { DistributionRunStatus } from '../enums/distribution-run-status';
import { TenantId } from '../value-objects/tenant-id';
import { EventId } from '../value-objects/event-id';

export class DistributionRun {
  private status: DistributionRunStatus;

  private startedAt?: Date;
  private finishedAt?: Date;

  // métricas de planejamento
  private totalFound = 0;
  private totalEligible = 0;

  // métricas de execução
  private totalProcessed = 0;
  private totalDistributed = 0;
  private totalFailed = 0;
  private totalDuplicated = 0;

  private constructor(
    private readonly id: EntityId,
    private readonly tenantId: TenantId,
    private readonly eventId: EventId,
    private readonly createdAt: Date,
  ) {
    this.status = DistributionRunStatus.CREATED;
  }

  // =========================
  // FACTORIES
  // =========================

  static create(params: { tenantId: TenantId; eventId: EventId }): DistributionRun {
    return new DistributionRun(EntityId.create(), params.tenantId, params.eventId, new Date());
  }

  static rehydrate(params: {
    id: string;
    tenantId: string;
    eventId: string;
    status: DistributionRunStatus;
    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
    totalFound: number;
    totalEligible: number;
    totalProcessed: number;
    totalDistributed: number;
    totalFailed: number;
    totalDuplicated?: number;
  }): DistributionRun {
    const run = new DistributionRun(
      EntityId.create(params.id),
      TenantId.create(params.tenantId),
      EventId.create(params.eventId),
      params.createdAt,
    );

    run.status = params.status;
    run.startedAt = params.startedAt;
    run.finishedAt = params.finishedAt;

    run.totalFound = params.totalFound;
    run.totalEligible = params.totalEligible;
    run.totalProcessed = params.totalProcessed;
    run.totalDistributed = params.totalDistributed;
    run.totalFailed = params.totalFailed;
    run.totalDuplicated = params.totalDuplicated ?? 0;

    return run;
  }

  // =========================
  // LIFECYCLE
  // =========================

  start(totalFound: number, totalEligible: number): void {
    assert(this.status === DistributionRunStatus.CREATED, 'distribution_not_created');
    assert(totalFound >= 0, 'total_found_invalid');
    assert(totalEligible >= 0, 'total_eligible_invalid');

    this.totalFound = totalFound;
    this.totalEligible = totalEligible;
    this.startedAt = new Date();
    this.status = DistributionRunStatus.RUNNING;
  }

  finish(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    assert(
      this.totalProcessed === this.totalDistributed + this.totalFailed + this.totalDuplicated,
      'metrics_inconsistent',
    );

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

  // =========================
  // METRICS (PER ITEM)
  // =========================

  incrementProcessed(): void {
    assert(
      this.status === DistributionRunStatus.RUNNING ||
        this.status === DistributionRunStatus.FINISHED,
      'distribution_not_active',
    );
    this.totalProcessed += 1;
  }

  incrementDistributed(): void {
    assert(
      this.status === DistributionRunStatus.RUNNING ||
        this.status === DistributionRunStatus.FINISHED,
      'distribution_not_active',
    );
    this.totalDistributed += 1;
  }

  incrementFailed(): void {
    assert(
      this.status === DistributionRunStatus.RUNNING ||
        this.status === DistributionRunStatus.FINISHED,
      'distribution_not_active',
    );
    this.totalFailed += 1;
  }

  incrementDuplicated(): void {
    assert(
      this.status === DistributionRunStatus.RUNNING ||
        this.status === DistributionRunStatus.FINISHED,
      'distribution_not_active',
    );
    this.totalDuplicated += 1;
  }

  markDistributed(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.totalDistributed += 1;
  }

  markDuplicated(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.totalDuplicated += 1;
  }

  markFailed(): void {
    assert(this.status === DistributionRunStatus.RUNNING, 'distribution_not_running');
    this.totalFailed += 1;
  }

  shouldFinish(): boolean {
    return (
      this.status === DistributionRunStatus.RUNNING && this.totalProcessed === this.totalEligible
    );
  }

  // =========================
  // GETTERS
  // =========================

  getId(): EntityId {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getStatus(): DistributionRunStatus {
    return this.status;
  }

  getEventId(): EventId {
    return this.eventId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getFinishedAt(): Date | undefined {
    return this.finishedAt;
  }

  getStartedAt(): Date {
    assert(this.startedAt !== undefined, 'distribution_run_not_started');
    return this.startedAt;
  }

  getMetrics() {
    return {
      totalFound: this.totalFound,
      totalEligible: this.totalEligible,
      totalProcessed: this.totalProcessed,
      totalDistributed: this.totalDistributed,
      totalFailed: this.totalFailed,
      totalDuplicated: this.totalDuplicated,
    };
  }

  finishIfCompleted(): boolean {
    if (this.shouldFinish()) {
      this.finish();
      return true;
    }
    return false;
  }
}
