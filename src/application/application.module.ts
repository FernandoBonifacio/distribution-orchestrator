import { Module } from '@nestjs/common';
import { StartDistributionUseCase } from './use-cases/start-distribution.use-case';
import { ProcessDistributionItemUseCase } from './use-cases/process-distribution-item.use-case';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [StartDistributionUseCase, ProcessDistributionItemUseCase],
  exports: [StartDistributionUseCase, ProcessDistributionItemUseCase],
})
export class ApplicationModule {}
