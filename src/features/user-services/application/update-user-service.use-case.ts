import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { UserAssistantCatalogPort } from '../domain/interfaces/user-assistant-catalog.port';
import { UserServiceConfigurationsRepositoryPort } from '../domain/interfaces/user-service-configurations-repository.port';
import { ServiceConfiguration } from '../domain/modelos/service-configuration.model';

export type UpdateUserServiceResult =
  | { kind: 'missing_openai_token' }
  | { kind: 'not_found'; serviceId: string }
  | { kind: 'assistant_not_found' }
  | { kind: 'ok'; data: ServiceConfiguration | null };

export class UpdateUserServiceUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly userAssistantCatalog: UserAssistantCatalogPort,
    private readonly userServiceConfigurations: UserServiceConfigurationsRepositoryPort
  ) {}

  async execute(
    userId: number,
    serviceId: string,
    body: { assistantId?: string; assistantName?: string; isActive?: boolean; configuration?: any }
  ): Promise<UpdateUserServiceResult> {
    const { assistantId, assistantName, isActive, configuration } = body;

    const credentials = await this.userCredentials.getById(userId);
    if (!credentials || !credentials.openaiToken) {
      return { kind: 'missing_openai_token' };
    }

    const existingConfig = await this.userServiceConfigurations.findOne(userId, serviceId);
    if (!existingConfig) {
      return { kind: 'not_found', serviceId };
    }

    if (assistantId && assistantId !== existingConfig.assistantId) {
      const assistants = await this.userAssistantCatalog.listAssistants(credentials);
      const assistantExists = assistants.some((a: any) => a.id === assistantId);
      if (!assistantExists) {
        return { kind: 'assistant_not_found' };
      }
    }

    let updatedConfiguration = existingConfig.configuration || {};
    if (configuration) {
      updatedConfiguration = { ...updatedConfiguration, ...configuration };
    }

    await this.userServiceConfigurations.update(userId, serviceId, {
      assistantId: assistantId || existingConfig.assistantId,
      assistantName: assistantName || existingConfig.assistantName,
      isActive: isActive !== undefined ? isActive : existingConfig.isActive,
      configuration: updatedConfiguration
    });

    const data = await this.userServiceConfigurations.findOne(userId, serviceId);

    return { kind: 'ok', data };
  }
}
