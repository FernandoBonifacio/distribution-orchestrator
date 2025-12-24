export const QUEUES = {
  DISTRIBUTION: 'distribution_queue',
  DISTRIBUTION_RETRY: 'distribution.queue.retry',
  DISTRIBUTION_DLQ: 'distribution.queue.dlq',
} as const;

export const EXCHANGES = {
  DISTRIBUTION: 'distribution_exchange',
} as const;

export const ROUTING_KEYS = {
  DISTRIBUTION: 'distribution.route',
} as const;
