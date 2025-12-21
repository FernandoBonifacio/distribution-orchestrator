import { DomainError } from 'src/domain/common/domain-error';
import { DistributionRun } from 'src/domain/distribution/entities/distribution-run';
import { EventId } from 'src/domain/distribution/value-objects/event-id';
import { TenantId } from 'src/domain/distribution/value-objects/tenant-id';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';

export class StartDistributionUseCase {
  constructor(private readonly distributionRepository: DistributionRunRepository) {}

  async execute(params: {
    tenantId: string;
    eventId: string;
    totalFound: number;
    totalEligible: number;
  }): Promise<DistributionRun> {
    const tenantId = TenantId.create(params.tenantId);
    const eventId = EventId.create(params.eventId);

    const activeRun = await this.distributionRepository.findActiveByEvent(eventId);

    if (activeRun) throw new DomainError('distribution_already_running');

    const run = DistributionRun.create({
      tenantId,
      eventId,
    });

    run.start(params.totalFound, params.totalEligible);
    await this.distributionRepository.save(run);
    return run;
  }
}
