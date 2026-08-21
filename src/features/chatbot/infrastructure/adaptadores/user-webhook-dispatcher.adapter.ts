import { UserWebhookService } from '../servicios/user-webhook.service';
import { UserWebhookDispatcherPort, WebhookDispatchPayload } from '../../domain/interfaces/user-webhook-dispatcher.port';
import { UserWebhookRecord } from '../../domain/interfaces/user-webhook-lookup.port';

export class UserWebhookDispatcherAdapter implements UserWebhookDispatcherPort {
  async dispatch(
    webhook: UserWebhookRecord,
    payload: WebhookDispatchPayload
  ): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
    const userWebhookService = UserWebhookService.getInstance();
    // executeWebhook solo lee name/url/id/assistantId/token del webhook — el shape plano de
    // UserWebhookRecord es compatible aunque el tipo declarado sea el modelo Sequelize.
    return userWebhookService.executeWebhook(webhook as any, payload);
  }
}
