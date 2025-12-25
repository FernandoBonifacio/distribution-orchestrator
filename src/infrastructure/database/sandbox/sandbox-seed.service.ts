import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SandboxEventOrmEntity } from './entities/sandbox-event.orm-entity';
import { SandboxUserDataOrmEntity } from './entities/sandbox-user-data.orm-entity';
import { SandboxBiometricOrmEntity } from './entities/sandbox-biometric.orm-entity';

@Injectable()
export class SandboxSeedService {
  private readonly logger = new Logger(SandboxSeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Cria dados sandbox para teste de distribuição
   *
   * @param params.eventExternalId external_id do evento
   * @param params.companyId company_id usado no join
   * @param params.total quantidade de usuários/biometrias
   */
  async seed(params: { eventExternalId: string; companyId: string; total: number }): Promise<void> {
    const { eventExternalId, companyId, total } = params;

    this.logger.log(`Starting sandbox seed | event=${eventExternalId} | total=${total}`);

    await this.dataSource.transaction(async (manager) => {
      const event = manager.create(SandboxEventOrmEntity, {
        externalId: eventExternalId,
        companyId,
        isActive: true,
      });

      await manager.save(event);

      await manager.save(event);

      const users: SandboxUserDataOrmEntity[] = [];
      const biometrics: SandboxBiometricOrmEntity[] = [];

      for (let i = 1; i <= total; i++) {
        const token = `sandbox-token-${i}`;
        const document = `000000000${i}`.slice(-11);

        users.push(
          manager.create(SandboxUserDataOrmEntity, {
            document,
            token,
            originCompanyId: companyId,
          }),
        );

        biometrics.push(
          manager.create(SandboxBiometricOrmEntity, {
            originToken: token,
            resizedImageUrl: `https://sandbox.images/${i}.jpg`,
            status: 'approved',
          }),
        );
      }

      await manager.save(users);
      await manager.save(biometrics);
    });

    this.logger.log(`Sandbox seed finished | event=${eventExternalId} | total=${total}`);
  }

  async clear(): Promise<void> {
    this.logger.warn('Clearing sandbox tables');

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SandboxBiometricOrmEntity, {});
      await manager.delete(SandboxUserDataOrmEntity, {});
      await manager.delete(SandboxEventOrmEntity, {});
    });

    this.logger.warn('Sandbox tables cleared');
  }
}
