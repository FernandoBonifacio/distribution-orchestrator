import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';

@Injectable()
export class SandboxBiometricQueryGateway implements BiometricQueryGateway {
  constructor(private readonly dataSource: DataSource) {}

  async findEligibleByEvent(params: { eventId: string }): Promise<
    {
      document: string;
      biometricId: string;
      imageUrl: string;
    }[]
  > {
    const { eventId } = params;
    const rows = await this.dataSource.query(
      `
      SELECT
        ud.document,
        b.id as "biometricId",
        b."resizedImageUrl" as "imageUrl"
      FROM sandbox_user_data ud
      JOIN sandbox_biometric b
        ON b."originToken" = ud.token
      JOIN sandbox_events e
        ON e.company_id = ud.origin_company_id
      WHERE b.status = 'approved'
        AND e.external_id = $1
        AND e.is_active = true
      `,
      [eventId],
    );

    return rows;
  }
}
