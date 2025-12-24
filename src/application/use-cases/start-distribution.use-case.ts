import { DomainError } from 'src/domain/common/domain-error';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { RabbitMQProducer } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.producer';

export class StartDistributionUseCase {
  constructor(
    private readonly runRepo: DistributionRunRepository,
    private readonly eventRepo: EventDistributionRepository,
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

    const items = await this.eventRepo.findEligibleByEvent(eventId);

    for (const item of items) {
      await this.eventRepo.save(item);

      await this.producer.publish('distribution.run', {
        runId: run.getId().toString(),
        eventId: eventId.toString(),
        document: item.getDocument(),
        userId: item.getUserId(),
        biometricId: item.getBiometricId(),
      });

      run.markDistributed();
    }

    await this.runRepo.save(run);

    return run;
  }
}
