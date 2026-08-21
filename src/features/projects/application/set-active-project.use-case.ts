import { RequesterJiraCredentials } from '../domain/modelos/requester-jira-credentials.model';
import { RequesterJiraProjectsPort } from '../domain/interfaces/requester-jira-projects.port';
import { ActiveProjectRegistryPort } from '../domain/interfaces/active-project-registry.port';

export type SetActiveProjectResult =
  | { kind: 'no_credentials' }
  | { kind: 'not_found' }
  | { kind: 'ok'; activeProject: string };

export class SetActiveProjectUseCase {
  constructor(
    private readonly requesterJiraProjects: RequesterJiraProjectsPort,
    private readonly activeProjectRegistry: ActiveProjectRegistryPort
  ) {}

  async execute(requester: RequesterJiraCredentials, projectKey: string): Promise<SetActiveProjectResult> {
    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }

    const projects = await this.requesterJiraProjects.listProjects(requester);
    const projectExists = projects.some((p) => p.key === projectKey);
    if (!projectExists) {
      return { kind: 'not_found' };
    }

    this.activeProjectRegistry.set(projectKey);

    return { kind: 'ok', activeProject: projectKey };
  }
}
