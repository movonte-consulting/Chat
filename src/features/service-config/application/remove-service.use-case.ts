import { GlobalServiceRegistryPort } from '../domain/interfaces/global-service-registry.port';

export class RemoveServiceUseCase {
  constructor(private readonly registry: GlobalServiceRegistryPort) {}

  execute(serviceId: string): boolean {
    return this.registry.remove(serviceId);
  }
}
