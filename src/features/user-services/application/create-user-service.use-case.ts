import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { UserAssistantCatalogPort } from '../domain/interfaces/user-assistant-catalog.port';
import { UserServiceConfigurationsRepositoryPort } from '../domain/interfaces/user-service-configurations-repository.port';
import { ServiceConfiguration } from '../domain/modelos/service-configuration.model';

export type CreateUserServiceResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'missing_openai_token' }
  | { kind: 'assistant_not_found' }
  | { kind: 'already_exists'; serviceId: string }
  | { kind: 'internal_error' }
  | { kind: 'ok'; isAdmin: boolean; data: ServiceConfiguration | null };

export class CreateUserServiceUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly userAssistantCatalog: UserAssistantCatalogPort,
    private readonly userServiceConfigurations: UserServiceConfigurationsRepositoryPort
  ) {}

  async execute(
    userId: number,
    body: {
      serviceId?: string;
      serviceName?: string;
      assistantId?: string;
      assistantName?: string;
      projectKey?: string;
      websiteUrl?: string;
      requestedDomain?: string;
    }
  ): Promise<CreateUserServiceResult> {
    const { serviceId, serviceName, assistantId, assistantName, projectKey, websiteUrl, requestedDomain } = body;

    if (!serviceId || !serviceName || !assistantId || !assistantName) {
      return { kind: 'validation_error', message: 'Se requieren serviceId, serviceName, assistantId y assistantName' };
    }

    const credentials = await this.userCredentials.getById(userId);
    if (!credentials || !credentials.openaiToken) {
      return { kind: 'missing_openai_token' };
    }

    const assistants = await this.userAssistantCatalog.listAssistants(credentials);
    const assistantExists = assistants.some((a: any) => a.id === assistantId);
    if (!assistantExists) {
      return { kind: 'assistant_not_found' };
    }

    const existingConfig = await this.userServiceConfigurations.findOne(userId, serviceId);
    if (existingConfig) {
      return { kind: 'already_exists', serviceId };
    }

    const approvalStatus = credentials.role === 'admin' ? 'approved' : 'pending';

    const initialConfiguration: any = {};
    if (projectKey) initialConfiguration.projectKey = projectKey;
    if (websiteUrl) initialConfiguration.websiteUrl = websiteUrl;
    if (requestedDomain) initialConfiguration.requestedDomain = requestedDomain;

    const success = await this.userServiceConfigurations.create(userId, {
      serviceId,
      serviceName,
      assistantId,
      assistantName,
      isActive: true,
      configuration: initialConfiguration,
      approvalStatus
    });

    if (!success) {
      return { kind: 'internal_error' };
    }

    const createdService = await this.userServiceConfigurations.findOne(userId, serviceId);
    console.log(`✅ Servicio creado para usuario ${userId}:`, createdService);

    return { kind: 'ok', isAdmin: credentials.role === 'admin', data: createdService };
  }
}
