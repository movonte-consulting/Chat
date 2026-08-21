import { UserJiraService } from '../../../../services/user_jira_service';
import { WidgetScopedJiraPort } from '../../domain/interfaces/widget-scoped-jira.port';
import { JiraCredentials } from '../../domain/modelos/jira-credentials.model';

export class UserJiraScopedAdapter implements WidgetScopedJiraPort {
  async getIssueByKey(userId: number, credentials: JiraCredentials, issueKey: string): Promise<any> {
    const service = new UserJiraService(userId, credentials.token, credentials.url, credentials.email);
    return service.getIssueByKey(issueKey);
  }

  async addCommentToIssue(
    userId: number,
    credentials: JiraCredentials,
    issueKey: string,
    message: string,
    meta: { name: string; email: string; source: string }
  ): Promise<void> {
    const service: any = new UserJiraService(userId, credentials.token, credentials.url, credentials.email);
    await service.addCommentToIssue(issueKey, message, meta);
  }
}
