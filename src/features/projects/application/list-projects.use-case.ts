import { RequesterJiraCredentials } from '../domain/modelos/requester-jira-credentials.model';
import { RequesterJiraProjectsPort } from '../domain/interfaces/requester-jira-projects.port';

export type ListProjectsResult =
  | { kind: 'no_credentials' }
  | { kind: 'ok'; projects: any[] };

export class ListProjectsUseCase {
  constructor(private readonly requesterJiraProjects: RequesterJiraProjectsPort) {}

  async execute(requester: RequesterJiraCredentials): Promise<ListProjectsResult> {
    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }
    const projects = await this.requesterJiraProjects.listProjects(requester);
    return { kind: 'ok', projects };
  }
}
