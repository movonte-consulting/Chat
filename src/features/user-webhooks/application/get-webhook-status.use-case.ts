import { UserLookupPort } from '../domain/interfaces/user-lookup.port';
import { UserWebhookConfigPort } from '../domain/interfaces/user-webhook-config.port';

export type GetWebhookStatusResult =
  | { kind: 'user_not_found' }
  | {
      kind: 'ok';
      data: {
        isEnabled: boolean;
        webhookUrl: string | null;
        lastTest: string | null;
        filterEnabled: boolean;
        filterCondition: string | null;
        filterValue: string | null;
      };
    };

export class GetWebhookStatusUseCase {
  constructor(
    private readonly userLookup: UserLookupPort,
    private readonly userWebhookConfig: UserWebhookConfigPort
  ) {}

  async execute(userId: number): Promise<GetWebhookStatusResult> {
    const userExists = await this.userLookup.exists(userId);
    if (!userExists) {
      return { kind: 'user_not_found' };
    }

    const webhookConfig = this.userWebhookConfig.getWebhookConfiguration(userId);

    return {
      kind: 'ok',
      data: {
        isEnabled: webhookConfig?.isEnabled || false,
        webhookUrl: webhookConfig?.url || webhookConfig?.webhookUrl || null,
        lastTest: webhookConfig?.lastTest || null,
        filterEnabled: webhookConfig?.filterEnabled || false,
        filterCondition: webhookConfig?.filterCondition || null,
        filterValue: webhookConfig?.filterValue || null
      }
    };
  }
}
