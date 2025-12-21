import { assert } from 'console';

export class EventId {
  private constructor(private readonly value: string) {}

  static create(value: string): EventId {
    assert(!!value, 'event_id_required');
    return new EventId(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
