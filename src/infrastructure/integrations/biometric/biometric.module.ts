import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { SandboxBiometricQueryGateway } from '../biometric-query/sandbox-biometric-query.gateway';
import { HttpBiometricQueryGateway } from '../biometric-query/http-biometric-query.gateway';

@Module({
  imports: [ConfigModule],
  providers: [
    SandboxBiometricQueryGateway,
    HttpBiometricQueryGateway,
    {
      provide: BiometricQueryGateway,
      useFactory: (
        config: ConfigService,
        sandboxGateway: SandboxBiometricQueryGateway,
        httpGateway: HttpBiometricQueryGateway,
      ) => {
        const sandboxEnabled = config.get<string>('SANDBOX') === 'true';
        return sandboxEnabled ? sandboxGateway : httpGateway;
      },
      inject: [ConfigService, SandboxBiometricQueryGateway, HttpBiometricQueryGateway],
    },
  ],
  exports: [BiometricQueryGateway],
})
export class BiometricModule {}
