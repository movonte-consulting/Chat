import { DisabledTicket } from '../../domain/modelos/disabled-ticket.model';
import { TicketToggleRegistryPort } from '../../domain/interfaces/admin/ticket-toggle-registry.port';

export class GetDisabledTicketsUseCase {
  constructor(private readonly ticketToggleRegistry: TicketToggleRegistryPort) {}

  execute(): DisabledTicket[] {
    return this.ticketToggleRegistry.listAll();
  }
}
