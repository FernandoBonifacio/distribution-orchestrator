export interface BiometricDTO {
  biometricId: string;
  document: string;
  imageUrl: string;
}

export abstract class BiometricQueryGateway {
  abstract findEligibleByEvent(params: { eventId: string }): Promise<BiometricDTO[]>;
}
