import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StartDistributionUseCase } from '../application/use-cases/start-distribution.use-case';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const useCase = app.get(StartDistributionUseCase);

  const tenantId = process.env.TENANT_ID ?? 'sandbox-company';
  const eventId = process.env.EVENT_ID ?? 'event-sbx-001';
  const intervalMs = Number(process.env.POLL_INTERVAL_MS ?? 5 * 60 * 1000);
  const durationMs = process.env.POLL_DURATION_MS ? Number(process.env.POLL_DURATION_MS) : null;

  const startedAt = Date.now();
  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await useCase.execute({ tenantId, eventId, allowActive: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // Keeps polling even if a run is already active.
      console.log(`[poll] skipped | ${message}`);
    } finally {
      running = false;
    }
  };

  await tick();

  const handle = setInterval(async () => {
    if (durationMs !== null) {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= durationMs) {
        clearInterval(handle);
        await app.close();
        return;
      }
    }

    await tick();
  }, intervalMs);
}

bootstrap();
