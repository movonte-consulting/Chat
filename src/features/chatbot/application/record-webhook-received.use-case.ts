import { WebhookStatsPort } from '../domain/interfaces/webhook-stats.port';

/** Usado por el controller al recibir un webhook con content-length válido. */
export class RecordWebhookReceivedUseCase {
  constructor(private readonly stats: WebhookStatsPort) {}

  execute(): void {
    this.stats.increment('totalReceived');
  }
}
