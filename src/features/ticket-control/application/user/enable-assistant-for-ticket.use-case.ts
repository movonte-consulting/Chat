import { RequesterJiraPort } from '../../domain/interfaces/requester-jira.port';
import { AuthenticatedUserLookupPort } from '../../domain/interfaces/user/authenticated-user-lookup.port';
import { UserTicketToggleRegistryPort } from '../../domain/interfaces/user/user-ticket-toggle-registry.port';

export type UserEnableAssistantForTicketResult =
  | { kind: 'user_not_found' }
  | { kind: 'no_credentials' }
  | { kind: 'not_found'; issueKey: string }
  | { kind: 'enabled'; issueKey: string; issueSummary: string; enabledAt: string };

export class EnableAssistantForTicketUseCase {
  constructor(
    private readonly authenticatedUserLookup: AuthenticatedUserLookupPort,
    private readonly requesterJira: RequesterJiraPort,
    private readonly userTicketToggleRegistry: UserTicketToggleRegistryPort
  ) {}

  async execute(userId: number, issueKey: string): Promise<UserEnableAssistantForTicketResult> {
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

    await this.userTicketToggleRegistry.enable(userId, issueKey);

    return {
      kind: 'enabled',
      issueKey,
      issueSummary: issue.fields.summary,
      enabledAt: new Date().toISOString()
    };
  }
}
