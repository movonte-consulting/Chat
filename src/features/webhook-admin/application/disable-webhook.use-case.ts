import { WebhookConfigurationPort } from '../domain/interfaces/webhook-configuration.port';

export class DisableWebhookUseCase {
  constructor(private readonly webhookConfig: WebhookConfigurationPort) {}

  async execute(): Promise<void> {
    console.log('🚫 Deshabilitando webhook...');
    await this.webhookConfig.disableWebhook();
  }
}
