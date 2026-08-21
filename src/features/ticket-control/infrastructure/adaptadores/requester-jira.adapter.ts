import { UserJiraService } from '../../../../services/user_jira_service';
import { RequesterJiraCredentials } from '../../domain/modelos/disabled-ticket.model';
import { RequesterJiraPort } from '../../domain/interfaces/requester-jira.port';

/** El caller garantiza jiraToken/jiraUrl no nulos antes de invocar (ver use cases). */
export class RequesterJiraAdapter implements RequesterJiraPort {
  private buildService(credentials: RequesterJiraCredentials): UserJiraService {
    return new UserJiraService(credentials.userId, credentials.jiraToken!, credentials.jiraUrl!, credentials.email);
  }

  async getIssueByKey(credentials: RequesterJiraCredentials, issueKey: string): Promise<any | null> {
    return this.buildService(credentials).getIssueByKey(issueKey);
  }

  async addCommentToIssue(credentials: RequesterJiraCredentials, issueKey: string, commentText: string): Promise<void> {
    await this.buildService(credentials).addCommentToIssue(issueKey, commentText);
  }
}
