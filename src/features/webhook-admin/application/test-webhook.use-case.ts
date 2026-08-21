import { WebhookConfigurationPort } from '../domain/interfaces/webhook-configuration.port';
import { WebhookSenderPort } from '../domain/interfaces/webhook-sender.port';
import { WebhookSendResult } from '../domain/modelos/webhook-test-payload.model';

export type TestWebhookResult =
  | { kind: 'not_configured' }
  | { kind: 'ok'; webhookUrl: string; testResult: WebhookSendResult }
  | { kind: 'failed'; webhookUrl: string; testResult: WebhookSendResult };

export class TestWebhookUseCase {
  constructor(
    private readonly webhookConfig: WebhookConfigurationPort,
    private readonly webhookSender: WebhookSenderPort
  ) {}

  async execute(): Promise<TestWebhookResult> {
    console.log('🧪 Probando webhook...');

    const webhookUrl = this.webhookConfig.getWebhookUrl();
    if (!webhookUrl) {
      return { kind: 'not_configured' };
    }

    const testResult = await this.webhookSender.sendToWebhook({
      issueKey: 'TEST-1',
      message: 'Test message from CEO Dashboard - Webhook Integration Test',
      author: 'CEO Dashboard',
      timestamp: new Date().toISOString(),
      source: 'jira-comment',
      threadId: 'test_webhook_' + Date.now(),
      assistantId: 'test',
      assistantName: 'Test Assistant',
      response: 'This is a test response from the webhook system. The parallel flow is working correctly.',
      context: {
        isTest: true,
        testType: 'jira-automation-webhook',
        timestamp: new Date().toISOString()
      }
    });

    if (testResult.success) {
      return { kind: 'ok', webhookUrl, testResult };
    }
    return { kind: 'failed', webhookUrl, testResult };
  }
}
