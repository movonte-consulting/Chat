import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookRepositoryPort } from '../domain/interfaces/user-webhook-repository.port';

export type DeleteWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'user_not_found' }
  | { kind: 'not_found' }
  | { kind: 'ok' };

export class DeleteWebhookUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookRepository: UserWebhookRepositoryPort
  ) {}

  async execute(userId: number, id: string | undefined): Promise<DeleteWebhookResult> {
    if (!id || isNaN(Number(id))) {
      return { kind: 'validation_error', message: 'ID de webhook inválido' };
    }

    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    const deleted = await this.userWebhookRepository.deleteForUser(Number(id), userId);
    if (!deleted) {
      return { kind: 'not_found' };
    }

    return { kind: 'ok' };
  }
}
