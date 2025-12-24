import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';

@Injectable()
export class RabbitMQTopology {
  constructor(private readonly conn: RabbitMQConnection) {}

  async setup(): Promise<void> {
    const ch = await this.conn.getChannel();

    // Exchanges
    await ch.assertExchange('distribution.exchange', 'direct', { durable: true });
    await ch.assertExchange('distribution.dlx', 'direct', { durable: true });

    // MAIN QUEUE (dead-letter -> DLX)
    await ch.assertQueue('distribution.queue', {
      durable: true,
      deadLetterExchange: 'distribution.dlx',
      deadLetterRoutingKey: 'distribution.dlq',
    });
    await ch.bindQueue('distribution.queue', 'distribution.exchange', 'distribution.run');

    // RETRY QUEUE (TTL -> volta pra MAIN)
    await ch.assertQueue('distribution.retry.10s', {
      durable: true,
      messageTtl: 10_000,
      deadLetterExchange: 'distribution.exchange',
      deadLetterRoutingKey: 'distribution.run',
    });

    // DLQ
    await ch.assertQueue('distribution.dlq', { durable: true });
    await ch.bindQueue('distribution.dlq', 'distribution.dlx', 'distribution.dlq');
  }
}
