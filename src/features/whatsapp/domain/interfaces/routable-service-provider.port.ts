import { RoutableService } from '../modelos/intent-router.model';

export interface RoutableServiceProviderPort {
  getRoutableServices(userId: number): Promise<RoutableService[]>;
}
