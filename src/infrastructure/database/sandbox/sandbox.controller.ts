import { Body, Controller, Post, Delete } from '@nestjs/common';
import { SandboxSeedService } from './sandbox-seed.service';

@Controller('sandbox')
export class SandboxController {
  constructor(private readonly sandboxSeedService: SandboxSeedService) {}

  @Post('seed')
  async seed(@Body() body: { eventExternalId: string; companyId: string; total: number }) {
    await this.sandboxSeedService.seed({
      eventExternalId: body.eventExternalId,
      companyId: body.companyId,
      total: body.total,
    });

    return {
      message: 'Sandbox data created',
      eventExternalId: body.eventExternalId,
      total: body.total,
    };
  }

  @Delete('clear')
  async clear() {
    await this.sandboxSeedService.clear();

    return {
      message: 'Sandbox data cleared',
    };
  }
}
