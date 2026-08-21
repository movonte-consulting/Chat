import { UserWebhookConfiguration } from '../modelos/user-webhook-configuration.model';

export interface LegacyWebhookConfigPort {
  get(userId: number): UserWebhookConfiguration | null;
  set(userId: number, config: UserWebhookConfiguration): Promise<void>;
}
