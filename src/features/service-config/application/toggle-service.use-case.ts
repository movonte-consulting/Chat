import { GlobalServiceConfig } from '../domain/modelos/global-service-config.model';
import { GlobalServiceRegistryPort } from '../domain/interfaces/global-service-registry.port';

export type ToggleServiceResult =
  | { kind: 'not_found' }
  | { kind: 'ok'; isActive: boolean; config: GlobalServiceConfig | null };

export class ToggleServiceUseCase {
  constructor(private readonly registry: GlobalServiceRegistryPort) {}

  execute(serviceId: string, isActive: boolean): ToggleServiceResult {
    const success = this.registry.toggle(serviceId, isActive);
    if (!success) {
      return { kind: 'not_found' };
    }
    return { kind: 'ok', isActive, config: this.registry.get(serviceId) };
  }
}
