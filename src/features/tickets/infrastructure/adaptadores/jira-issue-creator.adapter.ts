import { UserJiraService } from '../../../../services/user_jira_service';
import { JiraCredentials } from '../../domain/modelos/jira-account.model';
import { CreateIssueParams, CreateIssueResult, JiraIssueCreatorPort } from '../../domain/interfaces/jira-issue-creator.port';

export class JiraIssueCreatorAdapter implements JiraIssueCreatorPort {
  async createIssue(userId: number, credentials: JiraCredentials, params: CreateIssueParams): Promise<CreateIssueResult> {
    const userJiraService = new UserJiraService(userId, credentials.token, credentials.url, credentials.email);
    const response = await userJiraService.createIssue(params);
    return { id: response.id, key: response.key };
  }
}
