import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`habla comigo papá ${port}`);
}
bootstrap();
