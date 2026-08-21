import { UserDisabledTicket } from '../../domain/modelos/user-disabled-ticket.model';
import { AuthenticatedUserLookupPort } from '../../domain/interfaces/user/authenticated-user-lookup.port';
import { UserTicketToggleRegistryPort } from '../../domain/interfaces/user/user-ticket-toggle-registry.port';

export type GetDisabledTicketsResult =
  | { kind: 'user_not_found' }
  | { kind: 'ok'; disabledTickets: UserDisabledTicket[] };

export class GetDisabledTicketsUseCase {
  constructor(
    private readonly authenticatedUserLookup: AuthenticatedUserLookupPort,
    private readonly userTicketToggleRegistry: UserTicketToggleRegistryPort
  ) {}

  async execute(userId: number): Promise<GetDisabledTicketsResult> {
    const requester = await this.authenticatedUserLookup.findById(userId);
    if (!requester) {
      return { kind: 'user_not_found' };
    }

    const disabledTickets = await this.userTicketToggleRegistry.listAll(userId);
    return { kind: 'ok', disabledTickets };
  }
}
