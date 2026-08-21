import { DisabledTicket } from '../../domain/modelos/disabled-ticket.model';
import { TicketToggleRegistryPort } from '../../domain/interfaces/admin/ticket-toggle-registry.port';

export interface TicketAssistantStatus {
  issueKey: string;
  isDisabled: boolean;
  ticketInfo: DisabledTicket | null;
}

export class CheckTicketAssistantStatusUseCase {
  constructor(private readonly ticketToggleRegistry: TicketToggleRegistryPort) {}

  execute(issueKey: string): TicketAssistantStatus {
    const isDisabled = this.ticketToggleRegistry.isDisabled(issueKey);
    const ticketInfo = isDisabled ? this.ticketToggleRegistry.getInfo(issueKey) : null;
    return { issueKey, isDisabled, ticketInfo };
  }
}
