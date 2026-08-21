import { WebhookRepositoryPort } from '../domain/interfaces/webhook-repository.port';
import { ServiceExistenceCheckerPort } from '../domain/interfaces/service-existence-checker.port';
import { UpdateWebhookInput, WebhookRecord } from '../domain/modelos/webhook.model';

export type UpdateWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'service_not_found' }
  | { kind: 'ok'; data: WebhookRecord };

export class UpdateWebhookUseCase {
  constructor(
    private readonly webhookRepository: WebhookRepositoryPort,
    private readonly serviceExistenceChecker: ServiceExistenceCheckerPort
  ) {}

  async execute(id: string | undefined, input: UpdateWebhookInput): Promise<UpdateWebhookResult> {
    if (!id) {
      return { kind: 'validation_error', message: 'ID del webhook es requerido' };
    }

    const existingWebhook = await this.webhookRepository.findById(id);
    if (!existingWebhook) {
      return { kind: 'not_found' };
    }

    if (input.serviceId) {
      const serviceExists = await this.serviceExistenceChecker.exists(existingWebhook.userId, input.serviceId);
      if (!serviceExists) {
        return { kind: 'service_not_found' };
      }
    }

    const data = await this.webhookRepository.update(id, input);

    return { kind: 'ok', data };
  }
}
