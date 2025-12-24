import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';

@Injectable()
export class RabbitMQTopology {
  private readonly logger = new Logger(RabbitMQTopology.name);

  static QUEUE = 'distribution.queue';
  static DLX = 'distribution.dlx';
  static DLQ = 'distribution.dlq';
  static DLQ_ROUTING_KEY = 'distribution.dlq';

  constructor(private readonly conn: RabbitMQConnection) {}

  async setup(): Promise<void> {
    const channel = await this.conn.getChannel();

    // DLX
    await channel.assertExchange(RabbitMQTopology.DLX, 'direct', { durable: true });

    // queue principal com dead-letter
    await channel.assertQueue(RabbitMQTopology.QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RabbitMQTopology.DLX,
        'x-dead-letter-routing-key': RabbitMQTopology.DLQ_ROUTING_KEY,
      },
    });

    // DLQ
    await channel.assertQueue(RabbitMQTopology.DLQ, { durable: true });
    await channel.bindQueue(
      RabbitMQTopology.DLQ,
      RabbitMQTopology.DLX,
      RabbitMQTopology.DLQ_ROUTING_KEY,
    );

    // (opcional) QoS
    await channel.prefetch(10);

    this.logger.log(`Topology ready: ${RabbitMQTopology.QUEUE} + DLQ ${RabbitMQTopology.DLQ}`);
  }
}
