import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookConfigPort } from '../domain/interfaces/user-webhook-config.port';

export type TestWebhookResult =
  | { kind: 'user_not_found' }
  | { kind: 'not_configured' }
  | { kind: 'ok'; webhookUrl: string; testData: any };

export class TestWebhookUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookConfig: UserWebhookConfigPort
  ) {}

  async execute(userId: number): Promise<TestWebhookResult> {
    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    const webhookConfig = this.userWebhookConfig.getWebhookConfiguration(userId);

    if (!webhookConfig?.url && !webhookConfig?.webhookUrl) {
      return { kind: 'not_configured' };
    }

    const testData = {
      test: true,
      message: 'Test webhook from user',
      timestamp: new Date().toISOString(),
      userId
    };

    await this.userWebhookConfig.setWebhookConfiguration(userId, {
      ...webhookConfig,
      lastTest: new Date().toISOString()
    });

    return { kind: 'ok', webhookUrl: webhookConfig?.url || webhookConfig?.webhookUrl || '', testData };
  }
}
