import { Module } from '@nestjs/common';
import { ApplicationModule } from 'src/application/application.module';
import { DistributionController } from './distribution.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [DistributionController],
})
export class HttpModule {}
