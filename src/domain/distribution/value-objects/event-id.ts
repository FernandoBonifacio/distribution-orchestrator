export class EventId {
  private constructor(private readonly value: string) {}

  static create(value: string): EventId {
    return new EventId(value);
  }

  equals(other: EventId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
