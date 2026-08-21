import { CorsRegistryPort } from '../domain/interfaces/cors-registry.port';

export class GetCorsStatsUseCase {
  constructor(private readonly corsRegistry: CorsRegistryPort) {}

  execute() {
    const stats = this.corsRegistry.getStats();
    return { ...stats, message: 'CORS configurado dinámicamente desde base de datos' };
  }
}
