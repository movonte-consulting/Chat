import { ServiceConfigurationSummary } from '../modelos/service-configuration-summary.model';

export interface ActiveServiceConfigurationsPort {
  listActiveForUser(userId: number): Promise<ServiceConfigurationSummary[]>;
}
