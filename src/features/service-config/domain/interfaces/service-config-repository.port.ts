import { ServiceConfigDetails } from '../modelos/service-config.model';

export interface ServiceConfigRepositoryPort {
  getByServiceId(serviceId: string, userId: number): Promise<ServiceConfigDetails | null>;
  update(serviceId: string, userId: number, assistantId: string, assistantName: string): Promise<boolean>;
}
