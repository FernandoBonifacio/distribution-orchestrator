import { Module } from '@nestjs/common';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';
import { HttpBiometricQueryGateway } from '../biometric-query/http-biometric-query.gateway';

@Module({
  providers: [
    {
      provide: BiometricQueryGateway,
      useClass: HttpBiometricQueryGateway,
    },
  ],
  exports: [BiometricQueryGateway],
})
export class BiometricModule {}
