/**
 * Comenta la respuesta de la IA en Jira. Prioriza la cuenta "assistant" configurada para el
 * servicio (feature tickets); si no existe, cae a JiraService global con las credenciales
 * propias del usuario como override — igual que el ChatbotController original.
 */

import { JiraService } from '../../../../services/jira_service';
import { UserJiraService } from '../../../../services/user_jira_service';
import { getAssistantJiraAccount } from '../../../../features/tickets';
import { JiraAiCommentPort, OwnJiraCredentials } from '../../domain/interfaces/jira-ai-comment.port';

export class JiraAiCommentAdapter implements JiraAiCommentPort {
  async addAiResponseComment(
    userId: number,
    serviceId: string,
    issueKey: string,
    text: string,
    ownCredentials: OwnJiraCredentials
  ): Promise<{ accountId?: string }> {
    const assistantAccount = await getAssistantJiraAccount(userId, serviceId);

    if (assistantAccount) {
      const assistantJiraService = new UserJiraService(
        userId,
        assistantAccount.token,
        assistantAccount.url,
        assistantAccount.email
      );
      const response = await assistantJiraService.addCommentToIssue(issueKey, text);
      return { accountId: response?.author?.accountId };
    }

    const jiraService = JiraService.getInstance();
    const response = await jiraService.addCommentToIssue(issueKey, text, {
      source: 'ai-response',
      userId,
      userEmail: ownCredentials.email,
      jiraToken: ownCredentials.jiraToken ?? undefined,
      jiraUrl: ownCredentials.jiraUrl ?? undefined
    });
    return { accountId: response?.author?.accountId };
  }
}
