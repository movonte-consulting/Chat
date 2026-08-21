import { JiraCredentials } from '../modelos/jira-credentials.model';

export interface WidgetScopedJiraPort {
  getIssueByKey(userId: number, credentials: JiraCredentials, issueKey: string): Promise<any>;
  addCommentToIssue(
    userId: number,
    credentials: JiraCredentials,
    issueKey: string,
    message: string,
    meta: { name: string; email: string; source: string }
  ): Promise<void>;
}
