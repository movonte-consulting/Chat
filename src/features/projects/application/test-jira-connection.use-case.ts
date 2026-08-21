import { RequesterJiraCredentials } from '../domain/modelos/requester-jira-credentials.model';
import { RequesterJiraProjectsPort } from '../domain/interfaces/requester-jira-projects.port';

export type TestJiraConnectionResult =
  | { kind: 'no_credentials' }
  | { kind: 'ok'; connectionResult: boolean };

export class TestJiraConnectionUseCase {
  constructor(private readonly requesterJiraProjects: RequesterJiraProjectsPort) {}

  async execute(requester: RequesterJiraCredentials): Promise<TestJiraConnectionResult> {
    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }
    const connectionResult = await this.requesterJiraProjects.testConnection(requester);
    return { kind: 'ok', connectionResult };
  }
}
