import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BiometricQueryGateway } from 'src/domain/integrations/biometric-query.gateway';

@Injectable()
export class SandboxBiometricQueryGateway implements BiometricQueryGateway {
  constructor(private readonly dataSource: DataSource) {}

  async findEligibleByEvent(): Promise<
    {
      document: string;
      biometricId: string;
      imageUrl: string;
    }[]
  > {
    const rows = await this.dataSource.query(
      `
      SELECT
        ud.document,
        b.id as "biometricId",
        b."resizedImageUrl" as "imageUrl"
      FROM sandbox_user_data ud
      JOIN sandbox_biometric b
        ON b."originToken" = ud.token
      WHERE b.status = 'approved'
      `,
    );

    return rows;
  }
}
