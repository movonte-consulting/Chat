import { UserJiraService } from '../../../../services/user_jira_service';
import { RequesterJiraProjectsPort } from '../../domain/interfaces/requester-jira-projects.port';
import { RequesterJiraCredentials } from '../../domain/modelos/requester-jira-credentials.model';

export class RequesterJiraProjectsRepository implements RequesterJiraProjectsPort {
  async listProjects(credentials: RequesterJiraCredentials): Promise<any[]> {
    const userJiraService = new UserJiraService(
      credentials.userId,
      credentials.jiraToken!,
      credentials.jiraUrl!,
      credentials.email
    );
    return userJiraService.listProjects();
  }
}
