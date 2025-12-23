import { EntityId } from '../../common/entity-id';
import { assert } from '../../common/assert';
import { DistributionItemStatus } from '../enums/distribution-item-status';
import { EventId } from '../value-objects/event-id';

export class EventDistribution {
  private status: DistributionItemStatus;
  private processedAt?: Date;
  private errorMessage?: string;

  private constructor(
    private readonly id: EntityId,
    private readonly distributionRunId: EntityId,
    private readonly eventId: EventId,
    private readonly document: string,
    private readonly userId: string,
    private readonly biometricId: string,
    private readonly createdAt: Date,
  ) {
    this.status = DistributionItemStatus.PENDING;
  }

  static create(params: {
    distributionRunId: EntityId;
    eventId: EventId;
    document: string;
    userId: string;
    biometricId: string;
  }): EventDistribution {
    assert(!!params.document, 'document_required');

    return new EventDistribution(
      EntityId.create(),
      params.distributionRunId,
      params.eventId,
      params.document,
      params.userId,
      params.biometricId,
      new Date(),
    );
  }

  static rehydrate(params: {
    id: string;
    distributionRunId: string;
    eventId: string;
    document: string;
    userId: string;
    biometricId: string;
    status: DistributionItemStatus;
    createdAt: Date;
    processedAt?: Date;
    errorMessage?: string;
  }): EventDistribution {
    const item = new EventDistribution(
      EntityId.create(params.id),
      EntityId.create(params.distributionRunId),
      EventId.create(params.eventId),
      params.document,
      params.userId,
      params.biometricId,
      params.createdAt,
    );

    item.status = params.status;
    item.processedAt = params.processedAt;
    item.errorMessage = params.errorMessage;

    return item;
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

  getId(): EntityId {
    return this.id;
  }

  getDistributionRunId(): EntityId {
    return this.distributionRunId;
  }

  getEventId(): EventId {
    return this.eventId;
  }

  getDocument(): string {
    return this.document;
  }

  getUserId(): string {
    return this.userId;
  }

  getBiometricId(): string {
    return this.biometricId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getProcessedAt(): Date | undefined {
    return this.processedAt;
  }

  getErrorMessage(): string | undefined {
    return this.errorMessage;
  }
}
