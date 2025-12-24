import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQProducer } from './rabbitmq.producer';
import { RabbitMQTopology } from './rabbitmq.topology';

const MAX_RETRIES = 5;

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  constructor(
    private readonly conn: RabbitMQConnection,
    private readonly producer: RabbitMQProducer,
    private readonly topology: RabbitMQTopology,
    private readonly logger = new Logger(RabbitMQConsumer.name),
  ) {}

  async onModuleInit() {
    await this.topology.setup();

    const ch = await this.conn.getChannel();

    ch.prefetch(10);

    await ch.consume('distribution.queue', async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        this.logger.log(`Processing message`, payload);
        ch.ack(msg);
      } catch (err) {
        this.logger.error('Error processing message', err instanceof Error ? err.stack : undefined);

        await this.handleFail(msg, 'processing_error');
        ch.ack(msg);
      }
    });
  }

  private async handleFail(msg: ConsumeMessage, errorMessage: string) {
    const headers = msg.properties.headers ?? {};
    const retryCount = Number(headers['x-retry-count'] ?? 0);
    const payload = JSON.parse(msg.content.toString());

    if (retryCount >= MAX_RETRIES) {
      // manda pra DLQ
      await this.producer.publish(
        'distribution.dlq',
        { ...payload, errorMessage, failedAt: new Date().toISOString() },
        { 'x-final-failure': true, 'x-retry-count': retryCount },
      );
      return;
    }

    // manda pra RETRY (TTL 10s) e volta pra principal depois
    const nextRetry = retryCount + 1;
    const ch = await this.conn.getChannel();
    ch.sendToQueue('distribution.retry.10s', Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      headers: { ...headers, 'x-retry-count': nextRetry, 'x-error': errorMessage },
    });
  }
}
