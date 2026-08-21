import { ServiceConfig } from '../modelos/ticket.model';

export interface ServiceConfigProviderPort {
  getServiceConfiguration(serviceId: string, userId?: number): Promise<ServiceConfig | null>;
}
