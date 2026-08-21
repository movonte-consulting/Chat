import { UserJiraService } from '../../../../services/user_jira_service';
import { RequesterJiraStatusesPort } from '../../domain/interfaces/requester-jira-statuses.port';
import { RequesterJiraCredentials } from '../../domain/modelos/requester-jira-credentials.model';

export class RequesterJiraStatusesAdapter implements RequesterJiraStatusesPort {
  async getAllPossibleStatuses(credentials: RequesterJiraCredentials): Promise<any[]> {
    const userJiraService = new UserJiraService(
      credentials.userId,
      credentials.jiraToken!,
      credentials.jiraUrl!,
      credentials.email
    );
    return userJiraService.getAllPossibleStatuses();
  }
}
