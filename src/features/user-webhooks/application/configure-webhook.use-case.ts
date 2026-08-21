import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookConfigPort } from '../domain/interfaces/user-webhook-config.port';

export type ConfigureWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'user_not_found' }
  | { kind: 'ok' };

export class ConfigureWebhookUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookConfig: UserWebhookConfigPort
  ) {}

  async execute(userId: number, webhookUrl: string | undefined): Promise<ConfigureWebhookResult> {
    if (!webhookUrl) {
      return { kind: 'validation_error', message: 'Se requiere la URL del webhook' };
    }

    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    await this.userWebhookConfig.setWebhookConfiguration(userId, {
      name: 'User Webhook',
      url: webhookUrl,
      description: 'Webhook configurado por el usuario',
      isEnabled: true,
      filterEnabled: false
    });

    return { kind: 'ok' };
  }
}
