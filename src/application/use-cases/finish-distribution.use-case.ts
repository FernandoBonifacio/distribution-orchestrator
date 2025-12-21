import { EntityId } from 'src/domain/common/entity-id';
import { DistributionRunRepository } from 'src/domain/repositories/distribution-run.repository';

export class FinishDistributionUseCase {
  constructor(private readonly distributionRunRepository: DistributionRunRepository) {}

  async execute(runId: string): Promise<void> {
    const id = EntityId.create(runId);
    const run = await this.distributionRunRepository.findById(id);
    if (!run) throw new Error('distribution_run_not_found');

    run.finish();
    await this.distributionRunRepository.save(run);
  }
}
