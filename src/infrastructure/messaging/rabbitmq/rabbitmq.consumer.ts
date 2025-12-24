import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { ProcessDistributionItemUseCase } from 'src/application/use-cases/process-distribution-item.use-case';

export class RabbitMQConsumer {
  private connection!: Connection;
  private channel!: Channel;

  constructor(private readonly processItemUseCase: ProcessDistributionItemUseCase) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL!);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue('distribution.queue', {
      durable: true,
    });
  }

  async consume(): Promise<void> {
    await this.channel.consume('distribution.queue', async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());

        await this.processItemUseCase.execute({
          runId: payload.runId,
          eventId: payload.eventId,
          document: payload.document,
          userId: payload.userId,
          biometricId: payload.biometricId,
          success: true,
        });

        this.channel.ack(msg);
      } catch (error) {
        console.error('Error processing distribution item :(', error);
        this.channel.nack(msg, false, false);
      }
    });
  }
}
