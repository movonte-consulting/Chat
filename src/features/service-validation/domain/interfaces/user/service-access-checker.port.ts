import { ServiceConfigurationRow } from '../../modelos/service-configuration-row.model';

export interface ServiceAccessCheckerPort {
  getServiceForUser(userId: number, serviceId: string): Promise<ServiceConfigurationRow | null>;
}
