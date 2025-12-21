import { EntityId } from '../../common/entity-id';
import { assert } from '../../common/assert';
import { DistributionItemStatus } from '../enums/distribution-item-status';

export class EventDistribution {
  private status: DistributionItemStatus;
  private readonly createdAt: Date;
  private processedAt?: Date;
  private errorMessage?: string;

  private constructor(
    private readonly id: EntityId,
    private readonly distributionRunId: EntityId,
    private readonly document: string,
    private readonly userId: string,
    private readonly biometricId: string,
  ) {
    this.status = DistributionItemStatus.PENDING;
    this.createdAt = new Date();
  }

  static create(params: {
    distributionRunId: EntityId;
    document: string;
    userId: string;
    biometricId: string;
  }): EventDistribution {
    assert(!!params.document, 'document_required');

    return new EventDistribution(
      EntityId.create(),
      params.distributionRunId,
      params.document,
      params.userId,
      params.biometricId,
    );
  }

  markSent(): void {
    assert(this.status === DistributionItemStatus.PENDING, 'item_not_pending');
    this.status = DistributionItemStatus.SENT;
  }

  markProcessed(): void {
    assert(this.status === DistributionItemStatus.SENT, 'item_not_sent');
    this.status = DistributionItemStatus.PROCESSED;
    this.processedAt = new Date();
  }

  markFailed(error: string): void {
    assert(
      this.status === DistributionItemStatus.SENT || this.status === DistributionItemStatus.PENDING,
      'invalid_state_for_fail',
    );
    this.status = DistributionItemStatus.FAILED;
    this.errorMessage = error;
    this.processedAt = new Date();
  }

  getStatus(): DistributionItemStatus {
    return this.status;
  }
}
