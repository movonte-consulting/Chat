import { WidgetJiraAccountResolverPort } from '../../domain/interfaces/widget-jira-account-resolver.port';
import { JiraCredentials } from '../../domain/modelos/jira-credentials.model';

export class WidgetJiraAccountAdapter implements WidgetJiraAccountResolverPort {
  async resolve(userId: number, serviceId: string): Promise<JiraCredentials | null> {
    const { getWidgetJiraAccount } = await import('../../../tickets');
    const account = await getWidgetJiraAccount(userId, serviceId);
    if (!account) return null;
    return { email: account.email, token: account.token, url: account.url };
  }
}
