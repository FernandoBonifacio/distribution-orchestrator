import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from './infrastructure/database/database.module';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq/rabbitmq.module';
import { ApplicationModule } from './application/application.module';
import { BiometricModule } from './infrastructure/integrations/biometric/biometric.module';
import { HttpModule } from './infrastructure/http/http.module';
import { HealthModule } from './infrastructure/health/health.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    DatabaseModule,
    RabbitMQModule,
    BiometricModule,
    ApplicationModule,
    HttpModule,
    HealthModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
