import { StatusBasedDisableConfigService } from '../../../../services/status_based_disable_config';
import { TicketDisableRegistry } from '../../../../services/ticket_disable_registry';
import { JiraService } from '../../../../services/jira_service';
import { StatusChangePort } from '../../domain/interfaces/status-change.port';

export class StatusChangeAdapter implements StatusChangePort {
  async checkAndHandle(issueKey: string, newStatus: string): Promise<boolean> {
    return StatusBasedDisableConfigService.getInstance().checkAndHandleStatusChange(issueKey, newStatus);
  }

  isDisabled(issueKey: string): boolean {
    return TicketDisableRegistry.getInstance().isTicketDisabled(issueKey);
  }

  async postStatusChangeComment(issueKey: string, commentText: string): Promise<void> {
    await JiraService.getInstance().addCommentToIssue(issueKey, commentText, {
      name: 'AI Status Manager',
      source: 'jira'
    });
  }
}
