import { ConfigurationService } from '../../../../services/configuration_service';
import { GlobalServiceConfig } from '../../domain/modelos/global-service-config.model';
import { GlobalServiceRegistryPort } from '../../domain/interfaces/global-service-registry.port';

export class GlobalServiceRegistryAdapter implements GlobalServiceRegistryPort {
  get(serviceId: string): GlobalServiceConfig | null {
    return ConfigurationService.getInstance().getServiceConfiguration(serviceId) as GlobalServiceConfig | null;
  }

  toggle(serviceId: string, isActive: boolean): boolean {
    return ConfigurationService.getInstance().toggleService(serviceId, isActive);
  }

  add(serviceId: string, serviceName: string, assistantId: string, assistantName: string): boolean {
    return ConfigurationService.getInstance().addService(serviceId, serviceName, assistantId, assistantName);
  }

  remove(serviceId: string): boolean {
    return ConfigurationService.getInstance().removeService(serviceId);
  }
}
