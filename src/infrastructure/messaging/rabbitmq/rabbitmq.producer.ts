import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';

@Injectable()
export class RabbitMQProducer {
  constructor(private readonly conn: RabbitMQConnection) {}

  async connect(): Promise<void> {
    await this.conn.getChannel();
  }

  async publish(queue: string, payload: unknown): Promise<void> {
    const channel = await this.conn.getChannel();

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
    });
  }
}
