import { Module, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQProducer } from './rabbitmq.producer';
import { RabbitMQTopology } from './rabbitmq.topology';
import { RabbitMQConsumer } from './rabbitmq.consumer';

@Module({
  providers: [RabbitMQConnection, RabbitMQProducer, RabbitMQTopology, RabbitMQConsumer],
  exports: [RabbitMQProducer, RabbitMQConnection],
})
export class RabbitMQModule implements OnModuleInit {
  constructor(private readonly topology: RabbitMQTopology) {}

  async onModuleInit() {
    await this.topology.setup();
  }
}
