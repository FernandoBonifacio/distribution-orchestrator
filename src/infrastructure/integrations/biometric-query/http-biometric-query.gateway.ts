import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  BiometricDTO,
  BiometricQueryGateway,
} from 'src/domain/integrations/biometric-query.gateway';

@Injectable()
export class HttpBiometricQueryGateway implements BiometricQueryGateway {
  async findEligibleByEvent(params: { eventId: string }): Promise<BiometricDTO[]> {
    const response = await axios.get<BiometricDTO[]>(
      `${process.env.BIOMETRIC_API_URL}/biometrics/eligible`,
      {
        params: {
          eventId: params.eventId,
        },
        timeout: 5000,
      },
    );

    return response.data.map((item) => ({
      biometricId: item.biometricId,
      document: item.document,
      imageUrl: item.imageUrl,
    }));
  }
}
