export class TenantId {
  private constructor(private readonly value: string) {}

  static create(value: string): TenantId {
    if (!value || !value.trim()) {
      throw new Error('tenant_id_required');
    }

    return new TenantId(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
