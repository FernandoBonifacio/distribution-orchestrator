import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DistributionRunRepository } from '../../domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from '../../domain/repositories/event-distribution.repository';

import { TypeOrmDistributionRunRepository } from './typeorm/repositories/typeorm-distribution-run.repository';
import { TypeOrmEventDistributionRepository } from './typeorm/repositories/typeorm-event-distribution.repository';

import { DistributionRunOrmEntity } from './typeorm/entities/distribution-run.orm-entity';
import { EventDistributionOrmEntity } from './typeorm/entities/event-distribution.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionRunOrmEntity, EventDistributionOrmEntity])],
  providers: [
    {
      provide: DistributionRunRepository,
      useClass: TypeOrmDistributionRunRepository,
    },
    {
      provide: EventDistributionRepository,
      useClass: TypeOrmEventDistributionRepository,
    },
  ],
  exports: [DistributionRunRepository, EventDistributionRepository],
})
export class DatabaseModule {}
