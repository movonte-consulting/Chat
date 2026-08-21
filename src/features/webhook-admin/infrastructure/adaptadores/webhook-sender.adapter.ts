import { WebhookSenderPort } from '../../domain/interfaces/webhook-sender.port';
import { WebhookPayload, WebhookSendResult } from '../../domain/modelos/webhook-test-payload.model';

export class WebhookSenderAdapter implements WebhookSenderPort {
  async sendToWebhook(payload: WebhookPayload): Promise<WebhookSendResult> {
    const { WebhookService } = await import('../../../../services/webhook_service');
    const webhookService = WebhookService.getInstance();
    return webhookService.sendToWebhook(payload);
  }
}
