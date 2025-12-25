import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StartDistributionUseCase } from '../application/use-cases/start-distribution.use-case';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const useCase = app.get(StartDistributionUseCase);

  await useCase.execute({
    tenantId: 'sandbox-company',
    eventId: 'event-sbx-001',
  });

  await app.close();
}

bootstrap();
