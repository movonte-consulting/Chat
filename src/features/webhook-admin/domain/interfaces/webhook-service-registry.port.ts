import { ServiceConfiguration } from '../modelos/webhook-configuration.model';

export interface WebhookServiceRegistryPort {
  getServiceConfiguration(serviceId: string): ServiceConfiguration | null;
  updateServiceConfiguration(serviceId: string, assistantId: string, assistantName: string): Promise<boolean>;
  toggleService(serviceId: string, isActive: boolean): boolean;
}
