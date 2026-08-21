import { WebhookStats } from '../modelos/webhook-stats.model';

export interface WebhookStatsSnapshot extends WebhookStats {
  processedCommentsCount: number;
  uptime: number;
}

export type WebhookStatCounter =
  | 'totalReceived'
  | 'duplicatesSkipped'
  | 'aiCommentsSkipped'
  | 'successfulResponses'
  | 'errors'
  | 'throttledRequests';

export interface WebhookStatsPort {
  getSnapshot(): WebhookStatsSnapshot;
  increment(counter: WebhookStatCounter): void;
  reset(): void;
}
