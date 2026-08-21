import { ConfigurationService } from '../../../../../services/configuration_service';
import { DisabledTicket } from '../../../domain/modelos/disabled-ticket.model';
import { TicketToggleRegistryPort } from '../../../domain/interfaces/admin/ticket-toggle-registry.port';

export class TicketToggleRegistryAdapter implements TicketToggleRegistryPort {
  disable(issueKey: string, reason: string): Promise<void> {
    return ConfigurationService.getInstance().disableAssistantForTicket(issueKey, reason);
  }

  enable(issueKey: string): Promise<void> {
    return ConfigurationService.getInstance().enableAssistantForTicket(issueKey);
  }

  isDisabled(issueKey: string): boolean {
    return ConfigurationService.getInstance().isTicketDisabled(issueKey);
  }

  getInfo(issueKey: string): DisabledTicket | null {
    return ConfigurationService.getInstance().getDisabledTicketInfo(issueKey) as DisabledTicket | null;
  }

  listAll(): DisabledTicket[] {
    return ConfigurationService.getInstance().getDisabledTickets() as DisabledTicket[];
  }
}
