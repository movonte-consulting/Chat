import { JiraService } from '../../../../services/jira_service';
import { ActiveProjectRegistryPort } from '../../domain/interfaces/active-project-registry.port';

export class ActiveProjectRegistryAdapter implements ActiveProjectRegistryPort {
  get(): string {
    return JiraService.getInstance().getActiveProject();
  }

  set(projectKey: string): void {
    JiraService.getInstance().setActiveProject(projectKey);
  }
}
