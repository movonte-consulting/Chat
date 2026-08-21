import { GlobalServiceConfig } from '../modelos/global-service-config.model';

export interface GlobalServiceRegistryPort {
  get(serviceId: string): GlobalServiceConfig | null;
  toggle(serviceId: string, isActive: boolean): boolean;
  add(serviceId: string, serviceName: string, assistantId: string, assistantName: string): boolean;
  remove(serviceId: string): boolean;
}
