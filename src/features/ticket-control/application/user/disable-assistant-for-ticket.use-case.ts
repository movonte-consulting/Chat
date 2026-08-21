import { RequesterJiraPort } from '../../domain/interfaces/requester-jira.port';
import { AuthenticatedUserLookupPort } from '../../domain/interfaces/user/authenticated-user-lookup.port';
import { UserTicketToggleRegistryPort } from '../../domain/interfaces/user/user-ticket-toggle-registry.port';

export type UserDisableAssistantForTicketResult =
  | { kind: 'user_not_found' }
  | { kind: 'no_credentials' }
  | { kind: 'not_found'; issueKey: string }
  | { kind: 'disabled'; issueKey: string; issueSummary: string; reason: string; disabledAt: string };

/** A diferencia de la variante admin, esta NUNCA comenta en Jira — solo verifica que el ticket existe. */
export class DisableAssistantForTicketUseCase {
  constructor(
    private readonly authenticatedUserLookup: AuthenticatedUserLookupPort,
    private readonly requesterJira: RequesterJiraPort,
    private readonly userTicketToggleRegistry: UserTicketToggleRegistryPort
  ) {}

  async execute(userId: number, issueKey: string, reason: string | undefined): Promise<UserDisableAssistantForTicketResult> {
    const requester = await this.authenticatedUserLookup.findById(userId);
    if (!requester) {
      return { kind: 'user_not_found' };
    }

    if (!requester.jiraToken || !requester.jiraUrl) {
      return { kind: 'no_credentials' };
    }

    const issue = await this.requesterJira.getIssueByKey(requester, issueKey);
    if (!issue) {
      return { kind: 'not_found', issueKey };
    }

    // Dos fallbacks distintos, igual que el original: el texto persistido usa 'Manual disable',
    // la respuesta al cliente usa 'No reason provided'.
    await this.userTicketToggleRegistry.disable(userId, issueKey, reason || 'Manual disable');

    return {
      kind: 'disabled',
      issueKey,
      issueSummary: issue.fields.summary,
      reason: reason || 'No reason provided',
      disabledAt: new Date().toISOString()
    };
  }
}
