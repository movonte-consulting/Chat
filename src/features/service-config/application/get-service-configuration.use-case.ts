import { ServiceConfigDetails } from '../domain/modelos/service-config.model';
import { ServiceConfigRepositoryPort } from '../domain/interfaces/service-config-repository.port';

export class GetServiceConfigurationUseCase {
  constructor(private readonly repository: ServiceConfigRepositoryPort) {}

  async execute(serviceId: string, userId: number): Promise<ServiceConfigDetails | null> {
    return this.repository.getByServiceId(serviceId, userId);
  }
}
