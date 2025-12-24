import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor() {
    collectDefaultMetrics();
  }

  distributionProcessed = new Counter({
    name: 'distribution_items_processed_total',
    help: 'Total number of processed distribution items',
    labelNames: ['eventId', 'tenantId', 'status'],
  });

  activeRuns = new Gauge({
    name: 'distribution_active_runs',
    help: 'Number of active distribution runs',
  });

  distributionLatency = new Histogram({
    name: 'distribution_item_latency_seconds',
    help: 'Latency of processing a distribution item',
    labelNames: ['eventId'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  });
}
