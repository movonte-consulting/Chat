import { JiraService } from '../../../../services/jira_service';
import { GlobalJiraStatusesPort } from '../../domain/interfaces/global-jira-statuses.port';

export class GlobalJiraStatusesAdapter implements GlobalJiraStatusesPort {
  async getAllPossibleStatuses(): Promise<any[]> {
    return JiraService.getInstance().getAllPossibleStatuses();
  }
}
