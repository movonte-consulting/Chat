import { CorsService } from '../../../../services/cors_service';
import { CorsRegistryPort } from '../../domain/interfaces/cors-registry.port';
import { CorsStats } from '../../domain/modelos/cors-stats.model';

export class CorsServiceAdapter implements CorsRegistryPort {
  private readonly corsService: CorsService;

  constructor() {
    this.corsService = CorsService.getInstance();
  }

  getStats(): CorsStats {
    return this.corsService.getStats();
  }

  async forceReload(): Promise<void> {
    await this.corsService.forceReload();
  }

  async addApprovedDomain(domain: string): Promise<void> {
    await this.corsService.addApprovedDomain(domain);
  }

  removeDomain(domain: string): void {
    this.corsService.removeDomain(domain);
  }
}
