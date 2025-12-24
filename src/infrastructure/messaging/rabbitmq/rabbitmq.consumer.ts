import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { ProcessDistributionItemUseCase } from 'src/application/use-cases/process-distribution-item.use-case';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly conn: RabbitMQConnection,
    private readonly processUseCase: ProcessDistributionItemUseCase,
  ) {}

  async onModuleInit() {
    const channel = await this.conn.getChannel();

    await channel.consume('distribution.queue', async (msg) => {
      if (!msg) return;

      const payload = JSON.parse(msg.content.toString());

      try {
        await this.processUseCase.execute(payload);
        channel.ack(msg);
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error('distribution failed', error.stack);
        } else {
          this.logger.error('distribution failed', JSON.stringify(error));
        }
        channel.nack(msg, false, false); // DLQ
      }
    });

    this.logger.log('Consumer ativo em distribution.queue');
  }
}
