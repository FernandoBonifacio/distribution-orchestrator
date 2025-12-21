import { assert } from 'console';

export class TenantId {
  private constructor(private readonly value: string) {}
  static create(value: string): TenantId {
    assert(!!value, 'tenant_id_required');
    return new TenantId(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
