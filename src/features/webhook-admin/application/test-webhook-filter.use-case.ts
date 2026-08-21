import { WebhookConfigurationPort } from '../domain/interfaces/webhook-configuration.port';

export interface TestWebhookFilterData {
  shouldSend: boolean;
  filterConfig: ReturnType<WebhookConfigurationPort['getWebhookFilterConfig']>;
  testResponse: any;
  timestamp: string;
}

export class TestWebhookFilterUseCase {
  constructor(private readonly webhookConfig: WebhookConfigurationPort) {}

  execute(testResponse: any): TestWebhookFilterData {
    console.log(`🧪 === TESTING WEBHOOK FILTER ===`);
    console.log(`📝 Test response:`, testResponse);

    const shouldSend = this.webhookConfig.shouldSendWebhook(testResponse);
    const filterConfig = this.webhookConfig.getWebhookFilterConfig();

    console.log(`📊 Test result:`, { shouldSend, filterConfig, testResponse });
    console.log(`✅ === WEBHOOK FILTER TEST COMPLETED ===`);

    return {
      shouldSend,
      filterConfig,
      testResponse,
      timestamp: new Date().toISOString()
    };
  }
}
