import { LegacyWebhookConfigPort } from '../domain/interfaces/legacy-webhook-config.port';

export type SetUserWebhookConfigurationResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok' };

export class SetUserWebhookConfigurationUseCase {
  constructor(private readonly legacyWebhookConfig: LegacyWebhookConfigPort) {}

  async execute(
    userId: number,
    name: string | undefined,
    url: string | undefined,
    description: string | undefined,
    isEnabled: boolean | undefined,
    filterEnabled: boolean | undefined,
    filterCondition: string | undefined,
    filterValue: string | undefined
  ): Promise<SetUserWebhookConfigurationResult> {
    if (!name || !url) {
      return { kind: 'validation_error', message: 'name y url son requeridos' };
    }

    await this.legacyWebhookConfig.set(userId, {
      name,
      url,
      description,
      isEnabled: isEnabled !== false,
      filterEnabled: filterEnabled || false,
      filterCondition,
      filterValue
    });

    return { kind: 'ok' };
  }
}
