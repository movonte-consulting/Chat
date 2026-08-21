import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookConfigPort } from '../domain/interfaces/user-webhook-config.port';

export type DisableWebhookResult = { kind: 'user_not_found' } | { kind: 'ok' };

export class DisableWebhookUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookConfig: UserWebhookConfigPort
  ) {}

  async execute(userId: number): Promise<DisableWebhookResult> {
    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    const webhookConfig = this.userWebhookConfig.getWebhookConfiguration(userId);
    if (webhookConfig) {
      await this.userWebhookConfig.setWebhookConfiguration(userId, { ...webhookConfig, isEnabled: false });
    }

    return { kind: 'ok' };
  }
}
