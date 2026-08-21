import { WebhookStatsPort } from '../domain/interfaces/webhook-stats.port';

/** Usado por el controller en el catch externo de handleJiraWebhook. */
export class RecordWebhookErrorUseCase {
  constructor(private readonly stats: WebhookStatsPort) {}

  execute(): void {
    this.stats.increment('errors');
  }
}
