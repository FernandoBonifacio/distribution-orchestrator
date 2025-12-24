import { EventId } from '../value-objects/event-id';
import { TenantId } from '../value-objects/tenant-id';
import { EntityId } from '../../common/entity-id';

export type SyncFinalInsertParams = {
  tenantId: TenantId;
  eventId: EventId;
  document: string;
  biometricId: string;
  imageUrl: string;
  runId?: EntityId;
};

export type SyncFinalInsertResult = { status: 'inserted' } | { status: 'already_exists' };

export abstract class SyncFinalRepository {
  abstract insert(params: SyncFinalInsertParams): Promise<SyncFinalInsertResult>;
}
