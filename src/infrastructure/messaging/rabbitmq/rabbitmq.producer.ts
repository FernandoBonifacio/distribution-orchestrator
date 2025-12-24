import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';

type RabbitMQHeaders = Record<string, unknown>;

@Injectable()
export class RabbitMQProducer {
  constructor(private readonly conn: RabbitMQConnection) {}

  async connect(): Promise<void> {
    await this.conn.getChannel();
  }

  async publish<TPayload extends object>(
    routingKey: string,
    payload: TPayload,
    headers?: RabbitMQHeaders,
  ): Promise<void> {
    const ch = await this.conn.getChannel();

    ch.publish('distribution.exchange', routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      headers: headers ?? {},
    });
  }
}
