import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookRepositoryPort } from '../domain/interfaces/user-webhook-repository.port';
import { UserWebhookListItem } from '../domain/modelos/webhook.model';

export type GetSavedWebhooksResult =
  | { kind: 'user_not_found' }
  | { kind: 'ok'; data: UserWebhookListItem[] };

export class GetSavedWebhooksUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookRepository: UserWebhookRepositoryPort
  ) {}

  async execute(userId: number): Promise<GetSavedWebhooksResult> {
    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    const data = await this.userWebhookRepository.listForUser(userId);
    return { kind: 'ok', data };
  }
}
