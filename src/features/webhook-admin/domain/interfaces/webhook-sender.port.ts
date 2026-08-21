import { WebhookPayload, WebhookSendResult } from '../modelos/webhook-test-payload.model';

export interface WebhookSenderPort {
  sendToWebhook(payload: WebhookPayload): Promise<WebhookSendResult>;
}
