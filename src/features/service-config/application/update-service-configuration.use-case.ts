import { ServiceConfigRepositoryPort } from '../domain/interfaces/service-config-repository.port';
import { AssistantCatalogPort } from '../domain/interfaces/assistant-catalog.port';

export type UpdateServiceConfigurationResult =
  | { kind: 'assistant_not_found' }
  | { kind: 'service_not_found' }
  | { kind: 'ok'; serviceId: string; assistantId: string; assistantName: string; lastUpdated: string };

export class UpdateServiceConfigurationUseCase {
  constructor(
    private readonly repository: ServiceConfigRepositoryPort,
    private readonly assistantCatalog: AssistantCatalogPort
  ) {}

  async execute(
    serviceId: string,
    userId: number,
    assistantId: string,
    assistantName: string
  ): Promise<UpdateServiceConfigurationResult> {
    const assistants = await this.assistantCatalog.listAssistants();
    if (!assistants.some((a) => a.id === assistantId)) {
      return { kind: 'assistant_not_found' };
    }

    const success = await this.repository.update(serviceId, userId, assistantId, assistantName);
    if (!success) {
      return { kind: 'service_not_found' };
    }

    return { kind: 'ok', serviceId, assistantId, assistantName, lastUpdated: new Date().toISOString() };
  }
}
