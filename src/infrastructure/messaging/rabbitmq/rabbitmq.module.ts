import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQProducer } from './rabbitmq.producer';
import { RabbitMQConsumer } from './rabbitmq.consumer';
import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQTopology } from './rabbitmq.topology';
import { ApplicationModule } from 'src/application/application.module';

@Module({
  imports: [forwardRef(() => ApplicationModule)],
  providers: [RabbitMQConnection, RabbitMQTopology, RabbitMQProducer, RabbitMQConsumer],
  exports: [RabbitMQProducer],
})
export class RabbitMQModule {}
