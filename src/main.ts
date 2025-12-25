import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const port = Number(process.env.APP_PORT || process.env.PORT || 3000);
  const host = process.env.HOST || 'localhost';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const sandbox = process.env.SANDBOX === 'true';

  await app.listen(port);

  const protocol = nodeEnv === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}:${port}`;

  logger.log(':) Application started successfully :)');
  logger.log(`→ Environment : ${nodeEnv}`);
  logger.log(`→ Sandbox     : ${sandbox}`);
  logger.log(`→ URL         : ${baseUrl}`);
  logger.log(`→ PID         : ${process.pid}`);
}

bootstrap();
