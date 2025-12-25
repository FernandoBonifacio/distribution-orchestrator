export const QUEUES = {
  DISTRIBUTION: 'distribution.queue',
  DISTRIBUTION_RETRY: 'distribution.queue.retry',
  DISTRIBUTION_DLQ: 'distribution.dlq',
} as const;

export const EXCHANGES = {
  DISTRIBUTION: 'distribution.exchange',
} as const;

export const ROUTING_KEYS = {
  DISTRIBUTION: 'distribution.route',
} as const;
