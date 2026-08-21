import { WebhookRepositoryPort } from '../domain/interfaces/webhook-repository.port';
import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { ServiceExistenceCheckerPort } from '../domain/interfaces/service-existence-checker.port';
import { CreateWebhookInput, WebhookRecord } from '../domain/modelos/webhook.model';

export type CreateWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'user_not_found' }
  | { kind: 'service_not_found' }
  | { kind: 'ok'; data: WebhookRecord };

export class CreateWebhookUseCase {
  constructor(
    private readonly webhookRepository: WebhookRepositoryPort,
    private readonly userLookup: UserLookupPort,
    private readonly serviceExistenceChecker: ServiceExistenceCheckerPort
  ) {}

  async execute(input: Partial<CreateWebhookInput>): Promise<CreateWebhookResult> {
    const { userId, name, url, description, serviceId, assistantId, token, filterEnabled, filterCondition, filterValue } = input;

    if (!userId || !name || !url) {
      return { kind: 'validation_error', message: 'userId, name y url son requeridos' };
    }

    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    if (serviceId) {
      const serviceExists = await this.serviceExistenceChecker.exists(userId, serviceId);
      if (!serviceExists) {
        return { kind: 'service_not_found' };
      }
    }

    const data = await this.webhookRepository.create({
      userId,
      name,
      url,
      description,
      serviceId,
      assistantId,
      token,
      filterEnabled,
      filterCondition,
      filterValue
    });

    console.log(`✅ Webhook de admin creado para usuario ${userId}:`, {
      id: data.id,
      name,
      serviceId,
      token: token ? '***' : null
    });

    return { kind: 'ok', data };
  }
}
