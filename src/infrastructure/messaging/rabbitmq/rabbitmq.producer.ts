import * as amqp from 'amqplib';

export class RabbitMQProducer {
  private connection: amqp.Connection;
  private channel: amqp.channel;

  async connect(): Promise<void> {
    this.connection = await amqp.conncet(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
  }

  async publish(queue: string, message: object): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });

    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  }
}
