import { WebhookConfigurationPort } from '../domain/interfaces/webhook-configuration.port';

export interface ConfigureWebhookFilterData {
  filterEnabled: boolean;
  filterCondition: string;
  filterValue: string;
  lastUpdated: string;
  currentConfig: ReturnType<WebhookConfigurationPort['getWebhookFilterConfig']>;
}

export class ConfigureWebhookFilterUseCase {
  constructor(private readonly webhookConfig: WebhookConfigurationPort) {}

  async execute(filterEnabled: boolean, filterCondition: string | undefined, filterValue: string | undefined): Promise<ConfigureWebhookFilterData> {
    console.log(`🔧 === CONFIGURING WEBHOOK FILTER ===`);
    console.log(`📋 Input parameters:`, { filterEnabled, filterCondition, filterValue });

    await this.webhookConfig.setWebhookFilter(
      filterEnabled,
      filterCondition || 'response_value',
      filterValue || 'Yes'
    );

    const currentConfig = this.webhookConfig.getWebhookFilterConfig();
    console.log(`📋 Current filter config:`, currentConfig);

    console.log(`✅ === WEBHOOK FILTER CONFIGURED ===`);

    return {
      filterEnabled,
      filterCondition: filterCondition || 'response_value',
      filterValue: filterValue || 'Yes',
      lastUpdated: new Date().toISOString(),
      currentConfig
    };
  }
}
