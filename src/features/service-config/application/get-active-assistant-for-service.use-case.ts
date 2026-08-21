import { GlobalServiceRegistryPort } from '../domain/interfaces/global-service-registry.port';

export interface ActiveAssistantForService {
  assistantId: string;
  assistantName: string;
  serviceName: string;
}

export class GetActiveAssistantForServiceUseCase {
  constructor(private readonly registry: GlobalServiceRegistryPort) {}

  execute(serviceId: string): ActiveAssistantForService | null {
    const config = this.registry.get(serviceId);
    if (!config || !config.isActive) {
      return null;
    }
    return { assistantId: config.assistantId, assistantName: config.assistantName, serviceName: config.serviceName };
  }
}
