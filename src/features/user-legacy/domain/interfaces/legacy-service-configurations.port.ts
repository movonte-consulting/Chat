import { ServiceConfigurationSummary } from '../modelos/service-configuration-summary.model';

export interface LegacyServiceConfigurationsPort {
  listAll(userId: number): ServiceConfigurationSummary[];
  setConfiguration(
    userId: number,
    serviceId: string,
    serviceName: string,
    assistantId: string,
    assistantName: string,
    isActive: boolean | undefined,
    configuration: any
  ): Promise<void>;
}
