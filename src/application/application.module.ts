import { Module, forwardRef } from '@nestjs/common';

import { StartDistributionUseCase } from './use-cases/start-distribution.use-case';
import { ProcessDistributionItemUseCase } from './use-cases/process-distribution-item.use-case';

import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { RabbitMQModule } from 'src/infrastructure/messaging/rabbitmq/rabbitmq.module';
import { BiometricModule } from 'src/infrastructure/integrations/biometric/biometric.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => RabbitMQModule), BiometricModule],
  providers: [StartDistributionUseCase, ProcessDistributionItemUseCase],
  exports: [StartDistributionUseCase, ProcessDistributionItemUseCase],
})
export class ApplicationModule {}
