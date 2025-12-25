import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  BiometricDTO,
  BiometricQueryGateway,
} from 'src/domain/integrations/biometric-query.gateway';

@Injectable()
export class HttpBiometricQueryGateway implements BiometricQueryGateway {
  async findEligibleByEvent(params: { eventId: string }): Promise<BiometricDTO[]> {
    const baseUrl = process.env.BIOMETRIC_QUERY_URL ?? process.env.BIOMETRIC_API_URL;
    if (!baseUrl) {
      throw new Error('biometric_query_url_not_configured');
    }

    const url = baseUrl.endsWith('/eligible') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/eligible`;

    const response = await axios.get<BiometricDTO[]>(url, {
      params: {
        eventId: params.eventId,
      },
      timeout: 5000,
    });

    return response.data.map((item) => ({
      biometricId: item.biometricId,
      document: item.document,
      imageUrl: item.imageUrl,
    }));
  }
}
