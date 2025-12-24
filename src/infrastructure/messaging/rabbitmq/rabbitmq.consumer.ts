import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQConnection } from './rabbitmq.connection';
import { ProcessDistributionItemUseCase } from 'src/application/use-cases/process-distribution-item.use-case';

@Injectable()
export class RabbitMQConsumer {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly connection: RabbitMQConnection,
    private readonly processUseCase: ProcessDistributionItemUseCase,
  ) {}

  async start(): Promise<void> {
    const channel = await this.connection.getChannel();

    await channel.consume('distribution.queue', async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      const payload = JSON.parse(msg.content.toString());

      try {
        await this.processUseCase.execute({
          runId: payload.runId,
          eventId: payload.eventId,
          document: payload.document,
          userId: payload.userId,
          biometricId: payload.biometricId,
        });

        channel.ack(msg);
      } catch (error) {
        this.logger.error('Erro ao processar item', error);

        //não requeue → vai para DLQ
        channel.nack(msg, false, false);
      }
    });

    this.logger.log('RabbitMQ Consumer listening on distribution.queue');
  }
}
