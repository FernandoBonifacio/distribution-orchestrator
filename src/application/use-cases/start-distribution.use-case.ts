import { Injectable } from '@nestjs/common';
import { DomainError } from 'src/domain/common/domain-error';
import { EntityId } from 'src/domain/common/entity-id';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { RabbitMQProducer } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.producer';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';

@Injectable()
export class StartDistributionUseCase {
  constructor(
    private readonly runRepo: DistributionRunRepository,
    private readonly eventRepo: EventDistributionRepository,
    private readonly biometricGateway: BiometricQueryGateway,
    private readonly producer: RabbitMQProducer,
  ) {}

  async execute(params: { tenantId: string; eventId: string }): Promise<DistributionRun> {
    const tenantId = TenantId.create(params.tenantId);
    const eventId = EventId.create(params.eventId);

    // 1️⃣ Garante que não existe run ativo
    const activeRun = await this.runRepo.findActiveByEvent(eventId);
    if (activeRun) {
      throw new DomainError('distribution_already_running');
    }

    // 2️⃣ Busca biometria elegível
    const biometrics = await this.biometricGateway.findEligibleByEvent({
      eventId: params.eventId,
    });

    const totalFound = biometrics.length;
    const totalEligible = biometrics.length;

    // 3️⃣ Cria run
    const run = DistributionRun.create({ tenantId, eventId });
    run.start(totalFound, totalEligible);
    await this.runRepo.save(run);

    // 4️⃣ Conecta no Rabbit
    await this.producer.connect();

    // 5️⃣ Publica mensagens
    for (const bio of biometrics) {
      const item = EventDistribution.create({
        distributionRunId: run.getId(),
        eventId,
        document: bio.document,
        userId: EntityId.create(bio.document),
        biometricId: EntityId.create(bio.biometricId),
      });

      await this.eventRepo.save(item);

      await this.producer.publish('distribution.queue', {
        runId: run.getId().toString(),
        eventId: eventId.toString(),
        document: bio.document,
        biometricId: bio.biometricId,
        imageUrl: bio.imageUrl,
      });
    }

    return run;
  }
}
