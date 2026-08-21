import { UserWebhookConfigRegistry } from '../../../../services/user_webhook_config_registry';
import { UserWebhookConfigPort } from '../../domain/interfaces/user-webhook-config.port';
import { UserWebhookConfiguration } from '../../domain/modelos/user-webhook-configuration.model';

export class UserConfigurationServiceAdapter implements UserWebhookConfigPort {
  getWebhookConfiguration(userId: number): UserWebhookConfiguration | null {
    return UserWebhookConfigRegistry.getInstance(userId).getWebhookConfiguration();
  }

  async setWebhookConfiguration(userId: number, config: UserWebhookConfiguration): Promise<void> {
    await UserWebhookConfigRegistry.getInstance(userId).setWebhookConfiguration(config);
  }
}
