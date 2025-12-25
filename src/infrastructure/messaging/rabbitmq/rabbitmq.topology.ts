import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { QUEUES } from './rabbitmq.queues';

@Injectable()
export class RabbitMQTopology implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQTopology.name);

  private static DLX = 'distribution.dlx';
  private static DLQ_ROUTING_KEY = 'distribution.dlq';

  constructor(private readonly conn: RabbitMQConnection) {}

  async onModuleInit() {
    await this.setup();
  }

  async setup(): Promise<void> {
    const channel = await this.conn.getChannel();

    // DLX
    await channel.assertExchange(RabbitMQTopology.DLX, 'direct', { durable: true });

    // queue principal com dead-letter
    await channel.assertQueue(QUEUES.DISTRIBUTION, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RabbitMQTopology.DLX,
        'x-dead-letter-routing-key': RabbitMQTopology.DLQ_ROUTING_KEY,
      },
    });

    // DLQ
    await channel.assertQueue(QUEUES.DISTRIBUTION_DLQ, { durable: true });
    await channel.bindQueue(
      QUEUES.DISTRIBUTION_DLQ,
      RabbitMQTopology.DLX,
      RabbitMQTopology.DLQ_ROUTING_KEY,
    );

    // (opcional) QoS
    await channel.prefetch(10);

    this.logger.log(`Topology ready: ${QUEUES.DISTRIBUTION} + DLQ ${QUEUES.DISTRIBUTION_DLQ}`);
  }
}
