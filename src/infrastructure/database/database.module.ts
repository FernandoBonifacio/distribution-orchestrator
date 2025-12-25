import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DistributionRunMinuteOrmEntity } from './typeorm/entities/distribution-run-minute.orm-entity';
import { DistributionRunOrmEntity } from './typeorm/entities/distribution-run.orm-entity';
import { SyncFinalRepository } from '../../domain/distribution/repositories/sync-final.repository';

import { TypeOrmDistributionRunRepository } from './typeorm/repositories/typeorm-distribution-run.repository';
import { TypeOrmEventDistributionRepository } from './typeorm/repositories/typeorm-event-distribution.repository';
import { TypeOrmSyncFinalRepository } from './typeorm/repositories/typeorm-sync-final.repository';

import { EventDistributionOrmEntity } from './typeorm/entities/event-distribution.orm-entity';
import { SyncFinalOrmEntity } from './typeorm/entities/sync-final.orm-entity';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';
import { TypeOrmDistributionRunMinuteRepository } from './typeorm/repositories/typeorm-distribution-run-minute.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DistributionRunOrmEntity,
      EventDistributionOrmEntity,
      SyncFinalOrmEntity,
      DistributionRunMinuteOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: DistributionRunRepository,
      useClass: TypeOrmDistributionRunRepository,
    },
    {
      provide: EventDistributionRepository,
      useClass: TypeOrmEventDistributionRepository,
    },
    {
      provide: SyncFinalRepository,
      useClass: TypeOrmSyncFinalRepository,
    },
    {
      provide: DistributionRunMinuteRepository,
      useClass: TypeOrmDistributionRunMinuteRepository,
    },
  ],
  exports: [
    DistributionRunRepository,
    EventDistributionRepository,
    SyncFinalRepository,
    DistributionRunMinuteRepository,
  ],
})
export class DatabaseModule {}
