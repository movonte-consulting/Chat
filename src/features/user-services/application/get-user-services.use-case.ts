import { UserServiceConfigurationsRepositoryPort } from '../domain/interfaces/user-service-configurations-repository.port';
import { ServiceConfiguration } from '../domain/modelos/service-configuration.model';

export class GetUserServicesUseCase {
  constructor(private readonly userServiceConfigurations: UserServiceConfigurationsRepositoryPort) {}

  async execute(userId: number): Promise<ServiceConfiguration[]> {
    return this.userServiceConfigurations.listForUser(userId);
  }
}
