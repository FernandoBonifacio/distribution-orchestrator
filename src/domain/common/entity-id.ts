import { randomUUID } from 'crypto';

export class EntityId {
  private constructor(private readonly value: string) {}

  static create(value?: string): EntityId {
    return new EntityId(value ?? randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }
}
