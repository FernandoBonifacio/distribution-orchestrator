import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DistributionRunRepository } from '../../domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from '../../domain/repositories/event-distribution.repository';

import { TypeOrmDistributionRunRepository } from './typeorm/repositories/typeorm-distribution-run.repository';
import { TypeOrmEventDistributionRepository } from './typeorm/repositories/typeorm-event-distribution.repository';

import { DistributionRunOrmEntity } from './typeorm/entities/distribution-run.orm-entity';
import { EventDistributionOrmEntity } from './typeorm/entities/event-distribution.orm-entity';
import { DistributionRunMinuteOrmEntity } from './typeorm/entities/distribution-run-minute.orm-entity';
import { DistributionRunMinuteRepository } from 'src/domain/repositories/distribution-run-minute.repository';
import { TypeOrmDistributionRunMinuteRepository } from './typeorm/repositories/typeorm-distribution-run-minute.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DistributionRunOrmEntity,
      EventDistributionOrmEntity,
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
      provide: DistributionRunMinuteRepository,
      useClass: TypeOrmDistributionRunMinuteRepository,
    },
  ],
  exports: [DistributionRunRepository, EventDistributionRepository],
})
export class DatabaseModule {}
