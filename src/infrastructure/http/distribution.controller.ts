import { Body, Controller, Headers, Post } from '@nestjs/common';
import { StartDistributionUseCase } from 'src/application/use-cases/start-distribution.use-case';

@Controller('distribution')
export class DistributionController {
  constructor(private readonly startDistributionUseCase: StartDistributionUseCase) {}

  @Post('start')
  async start(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: {
      eventId: string;
    },
  ) {
    if (!tenantId) {
      throw new Error('tenant_id_required');
    }

    const run = await this.startDistributionUseCase.execute({
      tenantId,
      eventId: body.eventId,
    });

    return {
      message: 'Distribution started',
      runId: run.getId().toString(),
      status: run.getStatus(),
    };
  }
}
