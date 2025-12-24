export interface MessageProducer<TPayload = unknown> {
  connect(): Promise<void>;
  publish(queue: string, payload: TPayload): Promise<void>;
}
