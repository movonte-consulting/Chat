import { LegacyWebhookConfigPort } from '../domain/interfaces/legacy-webhook-config.port';
import { UserWebhookConfiguration } from '../domain/modelos/user-webhook-configuration.model';

export class GetUserWebhookConfigurationUseCase {
  constructor(private readonly legacyWebhookConfig: LegacyWebhookConfigPort) {}

  execute(userId: number): UserWebhookConfiguration | null {
    return this.legacyWebhookConfig.get(userId);
  }
}
