import { UserWebhookConfiguration } from '../modelos/user-webhook-configuration.model';

/** Envuelve UserWebhookConfigRegistry (un webhook "simple" por usuario, en memoria/legacy). */
export interface UserWebhookConfigPort {
  getWebhookConfiguration(userId: number): UserWebhookConfiguration | null;
  setWebhookConfiguration(userId: number, config: UserWebhookConfiguration): Promise<void>;
}
