import { CorsRegistryPort } from '../domain/interfaces/cors-registry.port';
import { CorsStats } from '../domain/modelos/cors-stats.model';

export type RemoveCorsDomainResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; stats: CorsStats };

export class RemoveCorsDomainUseCase {
  constructor(private readonly corsRegistry: CorsRegistryPort) {}

  execute(domain: string | undefined): RemoveCorsDomainResult {
    if (!domain) {
      return { kind: 'validation_error', message: 'El dominio es requerido' };
    }
    this.corsRegistry.removeDomain(domain);
    return { kind: 'ok', stats: this.corsRegistry.getStats() };
  }
}
