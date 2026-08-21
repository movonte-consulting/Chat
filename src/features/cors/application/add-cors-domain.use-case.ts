import { CorsRegistryPort } from '../domain/interfaces/cors-registry.port';
import { CorsStats } from '../domain/modelos/cors-stats.model';

export type AddCorsDomainResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; stats: CorsStats };

export class AddCorsDomainUseCase {
  constructor(private readonly corsRegistry: CorsRegistryPort) {}

  async execute(domain: string | undefined): Promise<AddCorsDomainResult> {
    if (!domain) {
      return { kind: 'validation_error', message: 'El dominio es requerido' };
    }
    await this.corsRegistry.addApprovedDomain(domain);
    return { kind: 'ok', stats: this.corsRegistry.getStats() };
  }
}
