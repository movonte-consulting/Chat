import { RequesterJiraCredentials } from '../domain/modelos/requester-jira-credentials.model';
import { RequesterJiraProjectsPort } from '../domain/interfaces/requester-jira-projects.port';

export type GetProjectDetailsResult =
  | { kind: 'no_credentials' }
  | { kind: 'ok'; project: any };

export class GetProjectDetailsUseCase {
  constructor(private readonly requesterJiraProjects: RequesterJiraProjectsPort) {}

  async execute(requester: RequesterJiraCredentials, projectKey: string): Promise<GetProjectDetailsResult> {
    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }
    const project = await this.requesterJiraProjects.getProjectByKey(requester, projectKey);
    return { kind: 'ok', project };
  }
}
