import { ServiceConfigRegistry } from '../../../../services/service_config_registry';
import { GlobalServiceConfig } from '../../domain/modelos/global-service-config.model';
import { GlobalServiceRegistryPort } from '../../domain/interfaces/global-service-registry.port';

export class GlobalServiceRegistryAdapter implements GlobalServiceRegistryPort {
  get(serviceId: string): GlobalServiceConfig | null {
    return ServiceConfigRegistry.getInstance().getServiceConfiguration(serviceId) as GlobalServiceConfig | null;
  }

  toggle(serviceId: string, isActive: boolean): boolean {
    return ServiceConfigRegistry.getInstance().toggleService(serviceId, isActive);
  }

  add(serviceId: string, serviceName: string, assistantId: string, assistantName: string): boolean {
    return ServiceConfigRegistry.getInstance().addService(serviceId, serviceName, assistantId, assistantName);
  }

  remove(serviceId: string): boolean {
    return ServiceConfigRegistry.getInstance().removeService(serviceId);
  }
}
