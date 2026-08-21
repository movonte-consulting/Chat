import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { UserJiraProjectsPort } from '../domain/interfaces/user-jira-projects.port';

export type GetUserProjectsResult =
  | { kind: 'missing_jira_token' }
  | { kind: 'ok'; data: any[] };

export class GetUserProjectsUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly userJiraProjects: UserJiraProjectsPort
  ) {}

  async execute(userId: number): Promise<GetUserProjectsResult> {
    const credentials = await this.userCredentials.getById(userId);
    if (!credentials || !credentials.jiraToken) {
      return { kind: 'missing_jira_token' };
    }

    const data = await this.userJiraProjects.listProjects(credentials);

    return { kind: 'ok', data };
  }
}
