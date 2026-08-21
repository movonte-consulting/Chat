import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { ServiceExistenceCheckerPort } from '../domain/interfaces/service-existence-checker.port';
import { UserWebhookRepositoryPort } from '../domain/interfaces/user-webhook-repository.port';
import { UpdateWebhookInput, WebhookRecord } from '../domain/modelos/webhook.model';

export type UpdateWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'user_not_found' }
  | { kind: 'not_found' }
  | { kind: 'service_not_found' }
  | { kind: 'ok'; data: WebhookRecord };

export class UpdateWebhookUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly serviceExistenceChecker: ServiceExistenceCheckerPort,
    private readonly userWebhookRepository: UserWebhookRepositoryPort
  ) {}

  async execute(userId: number, id: string | undefined, input: UpdateWebhookInput): Promise<UpdateWebhookResult> {
    if (!id || isNaN(Number(id))) {
      return { kind: 'validation_error', message: 'ID de webhook inválido' };
    }

    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    // Nota: igual que el controller legacy, esta búsqueda NO filtra por userId — solo existencia
    // por id. A diferencia de deleteWebhook (que sí valida ownership vía DatabaseService), aquí
    // no se verifica que el webhook pertenezca a userId. Bug preexistente, preservado tal cual.
    const existingWebhook = await this.userWebhookRepository.findById(Number(id));
    if (!existingWebhook) {
      return { kind: 'not_found' };
    }

    if (input.serviceId) {
      const serviceExists = await this.serviceExistenceChecker.exists(userId, input.serviceId);
      if (!serviceExists) {
        return { kind: 'service_not_found' };
      }
    }

    const data = await this.userWebhookRepository.update(Number(id), input);

    console.log(`✅ Webhook ${id} actualizado para usuario ${userId}`);

    return { kind: 'ok', data };
  }
}
