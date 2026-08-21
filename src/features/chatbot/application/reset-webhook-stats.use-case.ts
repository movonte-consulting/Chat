import { WebhookStatsPort } from '../domain/interfaces/webhook-stats.port';

export class ResetWebhookStatsUseCase {
  constructor(private readonly stats: WebhookStatsPort) {}

  execute(): void {
    this.stats.reset();
    console.log('🔄 Webhook stats reset');
  }
}
