import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { ServiceExistenceCheckerPort } from '../domain/interfaces/service-existence-checker.port';
import { UserWebhookRepositoryPort } from '../domain/interfaces/user-webhook-repository.port';
import { CreateWebhookInput, WebhookRecord } from '../domain/modelos/webhook.model';

export type SaveWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'user_not_found' }
  | { kind: 'service_not_found' }
  | { kind: 'ok'; data: WebhookRecord };

export class SaveWebhookUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly serviceExistenceChecker: ServiceExistenceCheckerPort,
    private readonly userWebhookRepository: UserWebhookRepositoryPort
  ) {}

  async execute(userId: number, input: Partial<CreateWebhookInput>): Promise<SaveWebhookResult> {
    const { name, url, serviceId } = input;

    if (!name || !url) {
      return { kind: 'validation_error', message: 'name y url son requeridos' };
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

    const data = await this.userWebhookRepository.create(userId, input as CreateWebhookInput);

    console.log(`✅ Webhook creado para usuario ${userId}:`, {
      id: data.id,
      name,
      serviceId,
      token: input.token
    });

    return { kind: 'ok', data };
  }
}
