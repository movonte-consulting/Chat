import { WidgetJiraAccountResolverPort } from '../domain/interfaces/widget-jira-account-resolver.port';
import { WidgetScopedJiraPort } from '../domain/interfaces/widget-scoped-jira.port';
import { TicketDisableRegistryPort } from '../domain/interfaces/ticket-disable-registry.port';
import { DisabledTicketInfo } from '../domain/modelos/disabled-ticket-info.model';

export type SendMessageToJiraResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'no_widget_account'; serviceId: string }
  | { kind: 'ai_disabled'; disabledInfo: DisabledTicketInfo | null }
  | { kind: 'ok' };

export class SendMessageToJiraUseCase {
  constructor(
    private readonly widgetJiraAccountResolver: WidgetJiraAccountResolverPort,
    private readonly widgetScopedJira: WidgetScopedJiraPort,
    private readonly ticketDisableRegistry: TicketDisableRegistryPort
  ) {}

  async execute(
    userId: number,
    issueKey: string | undefined,
    message: string | undefined,
    customerInfo: { name: string; email: string } | undefined,
    serviceId: string | undefined
  ): Promise<SendMessageToJiraResult> {
    if (!issueKey || !message || !customerInfo) {
      return { kind: 'validation_error', message: 'Missing required fields: issueKey, message, and customerInfo' };
    }

    console.log(`📤 Sending message to Jira ticket ${issueKey}: ${message}`);

    if (!serviceId) {
      return { kind: 'validation_error', message: 'Missing required field: serviceId' };
    }

    const widgetAccount = await this.widgetJiraAccountResolver.resolve(userId, serviceId);
    if (!widgetAccount) {
      return { kind: 'no_widget_account', serviceId };
    }

    console.log(`✅ Using widget-specific Jira account for service ${serviceId}`);

    if (this.ticketDisableRegistry.isTicketDisabled(issueKey)) {
      const disabledInfo = this.ticketDisableRegistry.getDisabledTicketInfo(issueKey);
      console.log(`🚫 AI Assistant disabled for ticket ${issueKey}: ${disabledInfo?.reason || 'No reason provided'}`);

      await this.widgetScopedJira.addCommentToIssue(userId, widgetAccount, issueKey, message, {
        name: customerInfo.name,
        email: customerInfo.email,
        source: 'widget'
      });

      return { kind: 'ai_disabled', disabledInfo };
    }

    await this.widgetScopedJira.addCommentToIssue(userId, widgetAccount, issueKey, message, {
      name: customerInfo.name,
      email: customerInfo.email,
      source: 'widget'
    });

    console.log(`📤 Widget sending message to Jira: ${message}`);
    console.log(`🎯 Message will be processed by Jira webhook with landing-page assistant`);

    return { kind: 'ok' };
  }
}
