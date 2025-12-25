import { Module } from '@nestjs/common';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { SandboxBiometricQueryGateway } from '../biometric-query/sandbox-biometric-query.gateway';

@Module({
  providers: [
    {
      provide: BiometricQueryGateway,
      useClass: SandboxBiometricQueryGateway,
    },
  ],
  exports: [BiometricQueryGateway],
})
export class BiometricModule {}
