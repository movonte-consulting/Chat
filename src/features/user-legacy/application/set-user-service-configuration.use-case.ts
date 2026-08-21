import { LegacyServiceConfigurationsPort } from '../domain/interfaces/legacy-service-configurations.port';

export type SetUserServiceConfigurationResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok' };

export class SetUserServiceConfigurationUseCase {
  constructor(private readonly legacyServiceConfigurations: LegacyServiceConfigurationsPort) {}

  async execute(
    userId: number,
    serviceId: string | undefined,
    serviceName: string | undefined,
    assistantId: string | undefined,
    assistantName: string | undefined,
    isActive: boolean | undefined,
    configuration: any
  ): Promise<SetUserServiceConfigurationResult> {
    if (!serviceId || !serviceName || !assistantId || !assistantName) {
      return { kind: 'validation_error', message: 'serviceId, serviceName, assistantId y assistantName son requeridos' };
    }

    await this.legacyServiceConfigurations.setConfiguration(userId, serviceId, serviceName, assistantId, assistantName, isActive, configuration);

    return { kind: 'ok' };
  }
}
