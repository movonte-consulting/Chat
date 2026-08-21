import { WebhookRepositoryPort } from '../domain/interfaces/webhook-repository.port';
import { AdminWebhookListItem } from '../domain/modelos/webhook.model';

export class GetAllWebhooksUseCase {
  constructor(private readonly webhookRepository: WebhookRepositoryPort) {}

  async execute(): Promise<AdminWebhookListItem[]> {
    return this.webhookRepository.listAll();
  }
}
