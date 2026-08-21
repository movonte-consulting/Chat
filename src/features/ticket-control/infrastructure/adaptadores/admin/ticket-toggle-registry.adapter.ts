import { TicketDisableRegistry } from '../../../../../services/ticket_disable_registry';
import { DisabledTicket } from '../../../domain/modelos/disabled-ticket.model';
import { TicketToggleRegistryPort } from '../../../domain/interfaces/admin/ticket-toggle-registry.port';

export class TicketToggleRegistryAdapter implements TicketToggleRegistryPort {
  disable(issueKey: string, reason: string): Promise<void> {
    return TicketDisableRegistry.getInstance().disableAssistantForTicket(issueKey, reason);
  }

  enable(issueKey: string): Promise<void> {
    return TicketDisableRegistry.getInstance().enableAssistantForTicket(issueKey);
  }

  isDisabled(issueKey: string): boolean {
    return TicketDisableRegistry.getInstance().isTicketDisabled(issueKey);
  }

  getInfo(issueKey: string): DisabledTicket | null {
    return TicketDisableRegistry.getInstance().getDisabledTicketInfo(issueKey) as DisabledTicket | null;
  }

  listAll(): DisabledTicket[] {
    return TicketDisableRegistry.getInstance().getDisabledTickets() as DisabledTicket[];
  }
}
