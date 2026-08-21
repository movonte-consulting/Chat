import { UserJiraService } from '../../../../services/user_jira_service';
import { RequesterJiraCredentials } from '../../domain/modelos/requester-jira-credentials.model';
import { RequesterJiraProjectsPort } from '../../domain/interfaces/requester-jira-projects.port';

export class RequesterJiraProjectsAdapter implements RequesterJiraProjectsPort {
  private buildService(credentials: RequesterJiraCredentials): UserJiraService {
    return new UserJiraService(credentials.userId, credentials.jiraToken!, credentials.jiraUrl!, credentials.email);
  }

  async listProjects(credentials: RequesterJiraCredentials): Promise<any[]> {
    return this.buildService(credentials).listProjects();
  }

  async getProjectByKey(credentials: RequesterJiraCredentials, projectKey: string): Promise<any> {
    return this.buildService(credentials).getProjectByKey(projectKey);
  }

  async testConnection(credentials: RequesterJiraCredentials): Promise<boolean> {
    return this.buildService(credentials).testConnection();
  }
}
