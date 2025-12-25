import { Injectable } from '@nestjs/common';
import { DomainError } from 'src/domain/common/domain-error';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { RabbitMQProducer } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.producer';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';
import { QUEUES } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.queues';

@Injectable()
export class StartDistributionUseCase {
  constructor(
    private readonly runRepo: DistributionRunRepository,
    private readonly eventRepo: EventDistributionRepository,
    private readonly biometricGateway: BiometricQueryGateway,
    private readonly producer: RabbitMQProducer,
  ) {}

  async execute(params: {
    tenantId: string;
    eventId: string;
    allowActive?: boolean;
  }): Promise<DistributionRun> {
    const tenantId = TenantId.create(params.tenantId);
    const eventId = EventId.create(params.eventId);

    // 1️⃣ Garante que não existe run ativo
    const activeRun = await this.runRepo.findActiveByEvent(eventId);
    if (activeRun && !params.allowActive) {
      throw new DomainError('distribution_already_running');
    }

    // 2️⃣ Busca biometria elegível
    const biometrics = await this.biometricGateway.findEligibleByEvent({
      eventId: params.eventId,
    });

    const run = activeRun ?? DistributionRun.create({ tenantId, eventId });

    if (!activeRun) {
      const totalFound = biometrics.length;
      const totalEligible = biometrics.length;
      run.start(totalFound, totalEligible);
      await this.runRepo.save(run);

      if (totalEligible === 0) {
        run.finish();
        await this.runRepo.save(run);
        return run;
      }
    }

    // 4️⃣ Conecta no Rabbit
    await this.producer.connect();

    // 5️⃣ Publica mensagens
    let newItems = 0;
    for (const bio of biometrics) {
      const existing = await this.eventRepo.findByRunIdAndBiometricId(run.getId(), bio.biometricId);
      if (existing) {
        continue;
      }

      const item = EventDistribution.create({
        distributionRunId: run.getId(),
        eventId,
        document: bio.document,
        userId: bio.document,
        biometricId: bio.biometricId,
      });

      await this.eventRepo.save(item);
      newItems += 1;

      await this.producer.publish(QUEUES.DISTRIBUTION, {
        runId: run.getId().toString(),
        eventId: eventId.toString(),
        document: bio.document,
        userId: bio.document,
        biometricId: bio.biometricId,
        imageUrl: bio.imageUrl,
      });
    }

    if (activeRun && newItems > 0) {
      run.addPlanned(newItems, newItems);
      await this.runRepo.save(run);
    }

    return run;
  }
}
