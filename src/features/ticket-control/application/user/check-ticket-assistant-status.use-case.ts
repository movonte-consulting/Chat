import { UserDisabledTicket } from '../../domain/modelos/user-disabled-ticket.model';
import { RequesterJiraPort } from '../../domain/interfaces/requester-jira.port';
import { AuthenticatedUserLookupPort } from '../../domain/interfaces/user/authenticated-user-lookup.port';
import { UserTicketToggleRegistryPort } from '../../domain/interfaces/user/user-ticket-toggle-registry.port';

export type UserTicketAssistantStatusResult =
  | { kind: 'user_not_found' }
  | { kind: 'no_credentials' }
  | { kind: 'not_found'; issueKey: string }
  | { kind: 'status'; issueKey: string; isDisabled: boolean; ticketInfo: UserDisabledTicket | null };

/**
 * A diferencia de la variante admin (que no valida contra Jira), esta SÍ valida credenciales y
 * que el ticket exista antes de responder — comportamiento original preservado.
 */
export class CheckTicketAssistantStatusUseCase {
  constructor(
    private readonly authenticatedUserLookup: AuthenticatedUserLookupPort,
    private readonly requesterJira: RequesterJiraPort,
    private readonly userTicketToggleRegistry: UserTicketToggleRegistryPort
  ) {}

  async execute(userId: number, issueKey: string): Promise<UserTicketAssistantStatusResult> {
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

    const isDisabled = await this.userTicketToggleRegistry.isDisabled(userId, issueKey);
    // Se consulta siempre, igual que el original — solo se incluye en la respuesta si isDisabled.
    const ticketInfo = await this.userTicketToggleRegistry.getInfo(userId, issueKey);

    return { kind: 'status', issueKey, isDisabled, ticketInfo: isDisabled ? ticketInfo : null };
  }
}
