import { UserConfigurationService } from '../../../../services/user_configuration_service';
import { UserWebhookConfigPort } from '../../domain/interfaces/user-webhook-config.port';
import { UserWebhookConfiguration } from '../../domain/modelos/user-webhook-configuration.model';

export class UserConfigurationServiceAdapter implements UserWebhookConfigPort {
  getWebhookConfiguration(userId: number): UserWebhookConfiguration | null {
    return UserConfigurationService.getInstance(userId).getWebhookConfiguration();
  }

  async setWebhookConfiguration(userId: number, config: UserWebhookConfiguration): Promise<void> {
    await UserConfigurationService.getInstance(userId).setWebhookConfiguration(config);
  }
}
