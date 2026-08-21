import { ConfigurationService } from '../../../../services/configuration_service';
import { JiraService } from '../../../../services/jira_service';
import { StatusChangePort } from '../../domain/interfaces/status-change.port';

export class StatusChangeAdapter implements StatusChangePort {
  async checkAndHandle(issueKey: string, newStatus: string): Promise<boolean> {
    return ConfigurationService.getInstance().checkAndHandleStatusChange(issueKey, newStatus);
  }

  isDisabled(issueKey: string): boolean {
    return ConfigurationService.getInstance().isTicketDisabled(issueKey);
  }

  async postStatusChangeComment(issueKey: string, commentText: string): Promise<void> {
    await JiraService.getInstance().addCommentToIssue(issueKey, commentText, {
      name: 'AI Status Manager',
      source: 'jira'
    });
  }
}
