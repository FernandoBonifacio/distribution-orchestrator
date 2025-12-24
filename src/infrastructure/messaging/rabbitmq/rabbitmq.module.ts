import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../../application/application.module';

import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQTopology } from './rabbitmq.topology';
import { RabbitMQProducer } from './rabbitmq.producer';
import { RabbitMQConsumer } from './rabbitmq.consumer';

@Module({
  imports: [ApplicationModule],
  providers: [RabbitMQConnection, RabbitMQTopology, RabbitMQProducer, RabbitMQConsumer],
  exports: [RabbitMQProducer],
})
export class RabbitMQModule {}
