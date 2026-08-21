import { WebhookConfigurationPort } from '../domain/interfaces/webhook-configuration.port';
import { WebhookServiceRegistryPort } from '../domain/interfaces/webhook-service-registry.port';

export interface WebhookStatusData {
  webhookUrl: string | null;
  isEnabled: boolean;
  assistantId: string | null;
  assistantName: string | null;
  lastUpdated: Date | null;
  filter: {
    filterEnabled: boolean;
    filterCondition: string;
    filterValue: string;
  };
}

export class GetWebhookStatusUseCase {
  constructor(
    private readonly webhookConfig: WebhookConfigurationPort,
    private readonly serviceRegistry: WebhookServiceRegistryPort
  ) {}

  execute(): WebhookStatusData {
    const webhookConfig = this.webhookConfig.getWebhookConfiguration();
    const webhookService = this.serviceRegistry.getServiceConfiguration('webhook-parallel');
    const filterConfig = this.webhookConfig.getWebhookFilterConfig();

    return {
      webhookUrl: webhookConfig?.webhookUrl || null,
      isEnabled: this.webhookConfig.isWebhookEnabled(),
      assistantId: webhookService?.assistantId || null,
      assistantName: webhookService?.assistantName || null,
      lastUpdated: webhookConfig?.lastUpdated || null,
      filter: filterConfig || {
        filterEnabled: false,
        filterCondition: 'response_value',
        filterValue: 'Yes'
      }
    };
  }
}
