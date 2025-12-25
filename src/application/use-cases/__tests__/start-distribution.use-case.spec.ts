import { StartDistributionUseCase } from '../start-distribution.use-case';
import { DistributionRunStatus } from 'src/domain/distribution/enums/distribution-run-status';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';
import { EventDistributionRepository } from 'src/domain/repositories/event-distribution.repository';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { RabbitMQProducer } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.producer';

describe('StartDistributionUseCase', () => {
  const runRepo: jest.Mocked<DistributionRunRepository> = {
    findActiveByEvent: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    incrementMetrics: jest.fn(),
  };

  const eventRepo: jest.Mocked<EventDistributionRepository> = {
    save: jest.fn(),
    saveMany: jest.fn(),
    findByRunId: jest.fn(),
    findByRunIdAndBiometricId: jest.fn(),
    findFailedByRunId: jest.fn(),
    findEligibleByEvent: jest.fn(),
  };

  const biometricGateway: jest.Mocked<BiometricQueryGateway> = {
    findEligibleByEvent: jest.fn(),
  };

  const producer: jest.Mocked<RabbitMQProducer> = {
    connect: jest.fn(),
    publish: jest.fn(),
  } as unknown as jest.Mocked<RabbitMQProducer>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start a distribution run and enqueue items', async () => {
    runRepo.findActiveByEvent.mockResolvedValue(null);

    biometricGateway.findEligibleByEvent.mockResolvedValue([
      {
        document: '123',
        biometricId: 'bio-1',
        imageUrl: 'http://image-1',
      },
      {
        document: '456',
        biometricId: 'bio-2',
        imageUrl: 'http://image-2',
      },
    ]);

    const useCase = new StartDistributionUseCase(runRepo, eventRepo, biometricGateway, producer);

    const run = await useCase.execute({
      tenantId: 'tenant-1',
      eventId: 'event-1',
    });

    expect(run.getStatus()).toBe(DistributionRunStatus.RUNNING);

    expect(runRepo.save).toHaveBeenCalled();
    expect(eventRepo.save).toHaveBeenCalledTimes(2);
    expect(producer.publish).toHaveBeenCalledTimes(2);
  });

  it('should throw if a run is already active', async () => {
    const activeRun = DistributionRun.create({
      tenantId: TenantId.create('tenant-1'),
      eventId: EventId.create('event-1'),
    });
    runRepo.findActiveByEvent.mockResolvedValue(activeRun);

    const useCase = new StartDistributionUseCase(runRepo, eventRepo, biometricGateway, producer);

    await expect(
      useCase.execute({
        tenantId: 'tenant-1',
        eventId: 'event-1',
      }),
    ).rejects.toThrow();
  });
});
