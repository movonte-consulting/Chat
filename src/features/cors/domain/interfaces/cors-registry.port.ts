import { CorsStats } from '../modelos/cors-stats.model';

export interface CorsRegistryPort {
  getStats(): CorsStats;
  forceReload(): Promise<void>;
  addApprovedDomain(domain: string): Promise<void>;
  removeDomain(domain: string): void;
}
