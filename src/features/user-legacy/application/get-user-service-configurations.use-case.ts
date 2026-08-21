import { LegacyServiceConfigurationsPort } from '../domain/interfaces/legacy-service-configurations.port';
import { ServiceConfigurationSummary } from '../domain/modelos/service-configuration-summary.model';

export class GetUserServiceConfigurationsUseCase {
  constructor(private readonly legacyServiceConfigurations: LegacyServiceConfigurationsPort) {}

  execute(userId: number): ServiceConfigurationSummary[] {
    return this.legacyServiceConfigurations.listAll(userId);
  }
}
