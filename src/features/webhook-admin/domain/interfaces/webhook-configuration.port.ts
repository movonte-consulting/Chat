import { WebhookConfiguration } from '../modelos/webhook-configuration.model';
import { WebhookFilterConfig } from '../modelos/webhook-filter-config.model';

export interface WebhookConfigurationPort {
  getWebhookUrl(): string | null;
  setWebhookUrl(webhookUrl: string): Promise<void>;
  isWebhookEnabled(): boolean;
  setWebhookEnabled(isEnabled: boolean): Promise<void>;
  getWebhookConfiguration(): WebhookConfiguration | null;
  disableWebhook(): Promise<void>;
  getWebhookFilterConfig(): WebhookFilterConfig | null;
  setWebhookFilter(filterEnabled: boolean, filterCondition: string, filterValue: string): Promise<void>;
  shouldSendWebhook(assistantResponse: any): boolean;
}
