import { WidgetJiraAccountResolverPort } from '../domain/interfaces/widget-jira-account-resolver.port';
import { WidgetScopedJiraPort } from '../domain/interfaces/widget-scoped-jira.port';
import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';

export type ConnectToTicketResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'no_widget_account'; serviceId: string }
  | { kind: 'ticket_not_found' }
  | { kind: 'ok'; issue: any; jiraUrl: string; conversationHistory: any[] };

export class ConnectToTicketUseCase {
  constructor(
    private readonly widgetJiraAccountResolver: WidgetJiraAccountResolverPort,
    private readonly widgetScopedJira: WidgetScopedJiraPort,
    private readonly globalJira: GlobalJiraPort
  ) {}

  async execute(
    userId: number,
    issueKey: string | undefined,
    customerInfo: { name: string; email: string } | undefined,
    serviceId: string | undefined
  ): Promise<ConnectToTicketResult> {
    if (!issueKey || !customerInfo) {
      return { kind: 'validation_error', message: 'Missing required fields: issueKey and customerInfo' };
    }

    console.log(`🔗 Connecting widget to ticket ${issueKey} for customer ${customerInfo.email}`);

    if (!serviceId) {
      return { kind: 'validation_error', message: 'Missing required field: serviceId' };
    }

    const widgetAccount = await this.widgetJiraAccountResolver.resolve(userId, serviceId);
    if (!widgetAccount) {
      return { kind: 'no_widget_account', serviceId };
    }

    console.log(`✅ Using widget-specific Jira account for service ${serviceId}`);

    const issue = await this.widgetScopedJira.getIssueByKey(userId, widgetAccount, issueKey);
    if (!issue) {
      return { kind: 'ticket_not_found' };
    }

    await this.globalJira.createChatSession(issueKey, customerInfo, widgetAccount);
    const conversationHistory = await this.globalJira.getConversationHistory(issueKey, widgetAccount);

    return { kind: 'ok', issue, jiraUrl: widgetAccount.url, conversationHistory };
  }
}
