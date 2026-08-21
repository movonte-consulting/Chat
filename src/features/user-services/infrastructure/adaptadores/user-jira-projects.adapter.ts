import { UserJiraService } from '../../../../services/user_jira_service';
import { UserJiraProjectsPort } from '../../domain/interfaces/user-jira-projects.port';
import { UserOpenAiJiraCredentials } from '../../domain/modelos/user-openai-jira-credentials.model';

export class UserJiraProjectsAdapter implements UserJiraProjectsPort {
  async listProjects(credentials: UserOpenAiJiraCredentials): Promise<any[]> {
    const service = new UserJiraService(credentials.userId, credentials.jiraToken!, credentials.jiraUrl || '', credentials.email);
    return service.listProjects();
  }
}
