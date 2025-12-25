import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { ProcessDistributionItemUseCase } from 'src/application/use-cases/process-distribution-item.use-case';
import { QUEUES } from './rabbitmq.queues';
import { RabbitMQTopology } from './rabbitmq.topology';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly conn: RabbitMQConnection,
    private readonly processUseCase: ProcessDistributionItemUseCase,
    private readonly topology: RabbitMQTopology,
  ) {}

  async onModuleInit() {
    await this.topology.setup();
    const channel = await this.conn.getChannel();

    await channel.consume(QUEUES.DISTRIBUTION, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
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

    this.logger.log(`Consumer ativo em ${QUEUES.DISTRIBUTION}`);
  }
}
