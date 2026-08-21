import { ActiveProjectRegistryPort } from '../domain/interfaces/active-project-registry.port';

export class GetActiveProjectUseCase {
  constructor(private readonly activeProjectRegistry: ActiveProjectRegistryPort) {}

  execute(): string {
    return this.activeProjectRegistry.get();
  }
}
