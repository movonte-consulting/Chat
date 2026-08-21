import { GlobalServiceConfig } from '../domain/modelos/global-service-config.model';
import { GlobalServiceRegistryPort } from '../domain/interfaces/global-service-registry.port';
import { AssistantCatalogPort } from '../domain/interfaces/assistant-catalog.port';

export type AddServiceResult =
  | { kind: 'assistant_not_found' }
  | { kind: 'already_exists' }
  | { kind: 'add_failed' }
  | { kind: 'ok'; config: GlobalServiceConfig | null };

export class AddServiceUseCase {
  constructor(
    private readonly registry: GlobalServiceRegistryPort,
    private readonly assistantCatalog: AssistantCatalogPort
  ) {}

  async execute(serviceId: string, serviceName: string, assistantId: string, assistantName: string): Promise<AddServiceResult> {
    const assistants = await this.assistantCatalog.listAssistants();
    if (!assistants.some((a) => a.id === assistantId)) {
      return { kind: 'assistant_not_found' };
    }

    if (this.registry.get(serviceId)) {
      return { kind: 'already_exists' };
    }

    const success = this.registry.add(serviceId, serviceName, assistantId, assistantName);
    if (!success) {
      return { kind: 'add_failed' };
    }

    return { kind: 'ok', config: this.registry.get(serviceId) };
  }
}
