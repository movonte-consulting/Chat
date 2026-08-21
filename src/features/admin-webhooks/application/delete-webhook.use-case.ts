import { WebhookRepositoryPort } from '../domain/interfaces/webhook-repository.port';

export type DeleteWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'ok' };

export class DeleteWebhookUseCase {
  constructor(private readonly webhookRepository: WebhookRepositoryPort) {}

  async execute(id: string | undefined): Promise<DeleteWebhookResult> {
    if (!id) {
      return { kind: 'validation_error', message: 'ID del webhook es requerido' };
    }

    const existingWebhook = await this.webhookRepository.findById(id);
    if (!existingWebhook) {
      return { kind: 'not_found' };
    }

    await this.webhookRepository.delete(id);

    return { kind: 'ok' };
  }
}
