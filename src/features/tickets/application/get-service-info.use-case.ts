import { ServiceConfigProviderPort } from '../domain/interfaces/service-config-provider.port';
import { getProjectKeyFromConfig } from '../domain/modelos/ticket.model';

export interface ServiceInfo {
  serviceId: string;
  serviceName: string;
  assistantId: string | null;
  assistantName: string | null;
  isActive: boolean;
  projectKey: string | null;
  lastUpdated: Date | string | null;
}

export class GetServiceInfoUseCase {
  constructor(private readonly serviceConfigProvider: ServiceConfigProviderPort) {}

  async execute(serviceId: string, userId?: number): Promise<ServiceInfo | null> {
    const serviceConfig = await this.serviceConfigProvider.getServiceConfiguration(serviceId, userId);
    if (!serviceConfig) return null;

    return {
      serviceId: serviceConfig.serviceId,
      serviceName: serviceConfig.serviceName,
      assistantId: serviceConfig.assistantId,
      assistantName: serviceConfig.assistantName,
      isActive: serviceConfig.isActive,
      projectKey: getProjectKeyFromConfig(serviceConfig),
      lastUpdated: serviceConfig.lastUpdated
    };
  }
}
