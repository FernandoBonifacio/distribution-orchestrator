import { DomainError } from 'src/domain/common/domain-error';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { RabbitMQProducer } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.producer';
import { EventDistribution } from 'src/domain/distribution/entities/event-distribution';

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
    totalFound: number;
    totalEligible: number;
  }): Promise<DistributionRun> {
    const tenantId = TenantId.create(params.tenantId);
    const eventId = EventId.create(params.eventId);

    const activeRun = await this.runRepo.findActiveByEvent(eventId);
    if (activeRun) {
      throw new DomainError('distribution_already_running');
    }

    await this.producer.connect();

    const run = DistributionRun.create({ tenantId, eventId });
    run.start(params.totalFound, params.totalEligible);
    await this.runRepo.save(run);

    const biometrics = await this.biometricGateway.findEligibleByEvent({
      eventId: params.eventId,
    });

    for (const bio of biometrics) {
      // Auditoria: tentativa de distribuição
      const item = EventDistribution.create({
        distributionRunId: run.getId(),
        eventId,
        document: bio.document,
        userId: bio.document,
        biometricId: bio.biometricId,
      });

      await this.eventRepo.save(item);

      // Orquestração: envia para fila
      await this.producer.publish('distribution.queue', {
        runId: run.getId().toString(),
        eventId: eventId.toString(),
        document: bio.document,
        biometricId: bio.biometricId,
        imageUrl: bio.imageUrl,
      });
    }

    // ⚠️ Aqui NÃO se altera métricas de execução
    await this.runRepo.save(run);

    return run;
  }
}
