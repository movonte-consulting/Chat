import { JiraService } from '../../../../services/jira_service';
import { ActiveProjectRegistryPort } from '../../domain/interfaces/active-project-registry.port';

/** Envuelve el proyecto activo global (JiraService, singleton compartido, no por-usuario). */
export class ActiveProjectRegistryRepository implements ActiveProjectRegistryPort {
  get(): string {
    return JiraService.getInstance().getActiveProject();
  }
}
