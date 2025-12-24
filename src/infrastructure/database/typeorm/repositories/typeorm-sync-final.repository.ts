import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SyncFinalInsertParams,
  SyncFinalInsertResult,
  SyncFinalRepository,
} from 'src/domain/distribution/repositories/sync-final.repository';
import { SyncFinalOrmEntity } from '../entities/sync-final.orm-entity';

@Injectable()
export class TypeOrmSyncFinalRepository implements SyncFinalRepository {
  constructor(
    @InjectRepository(SyncFinalOrmEntity)
    private readonly repo: Repository<SyncFinalOrmEntity>,
  ) {}

  async insert(params: SyncFinalInsertParams): Promise<SyncFinalInsertResult> {
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(SyncFinalOrmEntity)
      .values({
        tenantId: params.tenantId.toString(),
        eventId: params.eventId.toString(),
        document: params.document,
        biometricId: params.biometricId,
        imageUrl: params.imageUrl,
        distributionRunId: params.runId?.toString() ?? null,
      })
      .orIgnore()
      .returning(['id'])
      .execute();

    if (!result.identifiers?.length) {
      return { status: 'already_exists' };
    }

    return { status: 'inserted' };
  }
}
