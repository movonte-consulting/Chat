/**
 * Resuelve credenciales de Jira (cuenta assistant del feature tickets, con fallback a las
 * credenciales propias del usuario) y comenta en el ticket via UserJiraService.
 */

import { getAssistantJiraAccount } from '../../../../features/tickets';
import { UserJiraService } from '../../../../services/user_jira_service';
import { User } from '../../../../models';
import { JiraCommenterPort } from '../../domain/interfaces/jira-commenter.port';

export class JiraCommenterAdapter implements JiraCommenterPort {
  private async getJiraCredentials(
    userId: number,
    serviceId: string
  ): Promise<{ email: string; token: string; url: string } | null> {
    const assistant = await getAssistantJiraAccount(userId, serviceId);
    if (assistant) return assistant;

    const user = await User.findByPk(userId);
    if (!user?.jiraToken || !(user as any).jiraUrl) return null;
    return { email: user.email, token: user.jiraToken, url: (user as any).jiraUrl };
  }

  async addComment(userId: number, serviceId: string, issueKey: string, commentText: string): Promise<void> {
    const creds = await this.getJiraCredentials(userId, serviceId);
    if (!creds) {
      console.error('❌ WhatsApp: no Jira credentials for user/service.');
      return;
    }

    const userJiraService = new UserJiraService(userId, creds.token, creds.url, creds.email);
    try {
      await userJiraService.addCommentToIssue(issueKey, commentText);
      console.log(`✅ [WhatsApp] Comment added to ${issueKey}`);
    } catch (err) {
      console.error(`❌ WhatsApp: failed to add comment to ${issueKey}:`, err);
    }
  }
}
