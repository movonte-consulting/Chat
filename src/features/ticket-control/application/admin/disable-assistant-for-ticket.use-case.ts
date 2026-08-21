import { RequesterJiraCredentials } from '../../domain/modelos/disabled-ticket.model';
import { RequesterJiraPort } from '../../domain/interfaces/requester-jira.port';
import { TicketToggleRegistryPort } from '../../domain/interfaces/admin/ticket-toggle-registry.port';

export type DisableAssistantForTicketResult =
  | { kind: 'no_credentials' }
  | { kind: 'not_found' }
  | { kind: 'disabled'; issueKey: string; issueSummary: string; reason: string; disabledAt: string };

export class DisableAssistantForTicketUseCase {
  constructor(
    private readonly requesterJira: RequesterJiraPort,
    private readonly ticketToggleRegistry: TicketToggleRegistryPort
  ) {}

  async execute(
    requester: RequesterJiraCredentials,
    issueKey: string,
    reason: string | undefined
  ): Promise<DisableAssistantForTicketResult> {
    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }

    const issue = await this.requesterJira.getIssueByKey(requester, issueKey);
    if (!issue) {
      return { kind: 'not_found' };
    }

    const finalReason = reason || 'No reason provided';
    const commentText = `🤖 **AI Assistant Disabled**\n\n` +
      `The AI assistant has been disabled for this ticket by ${requester.username}.\n` +
      `Reason: ${finalReason}\n` +
      `Disabled at: ${new Date().toISOString()}\n\n` +
      `To re-enable the assistant, use the CEO Dashboard.`;

    await this.requesterJira.addCommentToIssue(requester, issueKey, commentText);

    // Fire-and-forget deliberado, igual que el AdminController original — el Map en memoria
    // se actualiza de forma síncrona antes del primer await interno; la persistencia en DB
    // queda en segundo plano.
    this.ticketToggleRegistry.disable(issueKey, finalReason);

    return {
      kind: 'disabled',
      issueKey,
      issueSummary: issue.fields.summary,
      reason: finalReason,
      disabledAt: new Date().toISOString()
    };
  }
}
