/** Rama jira:issue_updated de handleJiraWebhook (antes: método privado handleStatusChange). */

import { JiraWebhookPayload } from '../../../types';
import { UserServiceResolverPort } from '../domain/interfaces/user-service-resolver.port';
import { StatusChangePort } from '../domain/interfaces/status-change.port';

type JiraIssue = JiraWebhookPayload['issue'];
type JiraChangelog = JiraWebhookPayload['changelog'];

export class HandleStatusChangeUseCase {
  constructor(
    private readonly userServiceResolver: UserServiceResolverPort,
    private readonly statusChange: StatusChangePort
  ) {}

  async execute(issue: JiraIssue, changelog?: JiraChangelog): Promise<void> {
    try {
      const issueKey = issue.key;
      const issueProjectKey = issueKey.split('-')[0];

      // Los flujos de status_change no filtran por approval_status (comportamiento existente).
      const userServiceInfo = await this.userServiceResolver.findByProjectKey(issueProjectKey, { requireApproved: false });
      if (!userServiceInfo) {
        console.log(`🚫 CAMBIO DE ESTADO IGNORADO: ${issueKey} no pertenece a ningún servicio de usuario activo`);
        return;
      }

      console.log(`🔄 Procesando cambio de estado para ticket ${issueKey}`);

      if (!changelog?.items) return;

      for (const item of changelog.items) {
        if (item.field !== 'status') continue;

        const oldStatus = item.fromString;
        const newStatus = item.toString;
        console.log(`📊 Cambio de estado detectado: ${oldStatus} → ${newStatus}`);

        const statusChanged = await this.statusChange.checkAndHandle(issueKey, newStatus || '');
        if (!statusChanged) continue;

        const isDisabled = this.statusChange.isDisabled(issueKey);
        const commentText = isDisabled
          ? `🤖 **AI Assistant Auto-Disabled**\n\nThe AI assistant has been automatically disabled because the ticket status changed to "${newStatus}".\n\nTo re-enable the assistant, change the status to a non-triggering state or use the CEO Dashboard.`
          : `🤖 **AI Assistant Auto-Enabled**\n\nThe AI assistant has been automatically re-enabled because the ticket status changed from a triggering state to "${newStatus}".`;

        await this.statusChange.postStatusChangeComment(issueKey, commentText);
        console.log(`✅ Comentario de cambio de estado agregado a ${issueKey}`);
      }
    } catch (error) {
      console.error('❌ Error procesando cambio de estado:', error);
    }
  }
}
