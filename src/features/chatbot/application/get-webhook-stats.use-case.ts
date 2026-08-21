import { WebhookStatsPort, WebhookStatsSnapshot } from '../domain/interfaces/webhook-stats.port';

export class GetWebhookStatsUseCase {
  constructor(private readonly stats: WebhookStatsPort) {}

  execute(): WebhookStatsSnapshot {
    return this.stats.getSnapshot();
  }
}
