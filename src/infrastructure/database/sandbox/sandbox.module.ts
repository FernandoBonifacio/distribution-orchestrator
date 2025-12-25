import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SandboxController } from './sandbox.controller';
import { SandboxSeedService } from './sandbox-seed.service';

import { SandboxEventOrmEntity } from './entities/sandbox-event.orm-entity';
import { SandboxUserDataOrmEntity } from './entities/sandbox-user-data.orm-entity';
import { SandboxBiometricOrmEntity } from './entities/sandbox-biometric.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SandboxEventOrmEntity,
      SandboxUserDataOrmEntity,
      SandboxBiometricOrmEntity,
    ]),
  ],
  controllers: [SandboxController],
  providers: [SandboxSeedService],
})
export class SandboxModule {}
