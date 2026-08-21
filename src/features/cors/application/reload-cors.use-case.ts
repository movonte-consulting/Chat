import { CorsRegistryPort } from '../domain/interfaces/cors-registry.port';
import { CorsStats } from '../domain/modelos/cors-stats.model';

export class ReloadCorsUseCase {
  constructor(private readonly corsRegistry: CorsRegistryPort) {}

  async execute(): Promise<CorsStats> {
    await this.corsRegistry.forceReload();
    return this.corsRegistry.getStats();
  }
}
