import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Channel, Connection } from 'amqplib';

@Injectable()
export class RabbitMQConnection implements OnModuleDestroy {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private readonly url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';

  async getChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    if (!this.connection) {
      this.connection = await amqp.connect(this.url);
    }

    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
