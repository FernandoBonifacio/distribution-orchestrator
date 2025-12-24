import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQTopology } from './rabbitmq.topology';
import { ProcessDistributionItemUseCase } from 'src/application/use-cases/process-distribution-item.use-case';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly conn: RabbitMQConnection,
    private readonly topology: RabbitMQTopology,
    private readonly processUseCase: ProcessDistributionItemUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.topology.setup();

    const channel = await this.conn.getChannel();

    await channel.consume(
      RabbitMQTopology.QUEUE,
      async (msg) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());

          await this.processUseCase.execute({
            runId: payload.runId,
            eventId: payload.eventId,
            document: payload.document,
            userId: payload.userId,
            biometricId: payload.biometricId,
            success: true, // depois vamos tornar isso real
          });

          channel.ack(msg);
        } catch (err: unknown) {
          if (err instanceof Error) {
            this.logger.error('Failed processing message -> sending to DLQ', err.stack);
          } else {
            this.logger.error('Failed processing message -> sending to DLQ', JSON.stringify(err));
          }

          channel.nack(msg, false, false); // rejeita e manda para DLQ
        }
      },
      { noAck: false },
    );

    this.logger.log(`RabbitMQ Consumer listening on ${RabbitMQTopology.QUEUE}`);
  }
}
