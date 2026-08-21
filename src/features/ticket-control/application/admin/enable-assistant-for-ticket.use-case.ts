import { RequesterJiraCredentials } from '../../domain/modelos/disabled-ticket.model';
import { RequesterJiraPort } from '../../domain/interfaces/requester-jira.port';
import { TicketToggleRegistryPort } from '../../domain/interfaces/admin/ticket-toggle-registry.port';

export type EnableAssistantForTicketResult =
  | { kind: 'no_credentials' }
  | { kind: 'not_found' }
  | { kind: 'enabled'; issueKey: string; issueSummary: string; enabledAt: string };

export class EnableAssistantForTicketUseCase {
  constructor(
    private readonly requesterJira: RequesterJiraPort,
    private readonly ticketToggleRegistry: TicketToggleRegistryPort
  ) {}

  async execute(requester: RequesterJiraCredentials, issueKey: string): Promise<EnableAssistantForTicketResult> {
    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }

    const issue = await this.requesterJira.getIssueByKey(requester, issueKey);
    if (!issue) {
      return { kind: 'not_found' };
    }

    const commentText = `🤖 **AI Assistant Re-enabled**\n\n` +
      `The AI assistant has been re-enabled for this ticket by ${requester.username}.\n` +
      `Re-enabled at: ${new Date().toISOString()}\n\n` +
      `The assistant will now respond to new comments.`;

    await this.requesterJira.addCommentToIssue(requester, issueKey, commentText);

    // Fire-and-forget deliberado — ver nota equivalente en disable-assistant-for-ticket.use-case.ts.
    this.ticketToggleRegistry.enable(issueKey);

    return {
      kind: 'enabled',
      issueKey,
      issueSummary: issue.fields.summary,
      enabledAt: new Date().toISOString()
    };
  }
}
