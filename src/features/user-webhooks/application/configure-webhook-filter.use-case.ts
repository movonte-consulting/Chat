import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookConfigPort } from '../domain/interfaces/user-webhook-config.port';

export type ConfigureWebhookFilterResult = { kind: 'user_not_found' } | { kind: 'ok' };

export class ConfigureWebhookFilterUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookConfig: UserWebhookConfigPort
  ) {}

  async execute(
    userId: number,
    filterEnabled: boolean | undefined,
    filterCondition: string | undefined,
    filterValue: string | undefined
  ): Promise<ConfigureWebhookFilterResult> {
    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    const webhookConfig = this.userWebhookConfig.getWebhookConfiguration(userId);
    if (webhookConfig) {
      await this.userWebhookConfig.setWebhookConfiguration(userId, {
        ...webhookConfig,
        filterEnabled: filterEnabled || false,
        filterCondition: filterCondition || 'response_value',
        filterValue: filterValue || 'Yes'
      });
    }

    return { kind: 'ok' };
  }
}
