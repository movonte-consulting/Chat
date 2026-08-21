import * as userTicketDisableService from '../../../../../services/user_ticket_disable_service';
import { UserDisabledTicket } from '../../../domain/modelos/user-disabled-ticket.model';
import { UserTicketToggleRegistryPort } from '../../../domain/interfaces/user/user-ticket-toggle-registry.port';

export class UserTicketToggleRegistryAdapter implements UserTicketToggleRegistryPort {
  async disable(userId: number, issueKey: string, reason: string): Promise<void> {
    await userTicketDisableService.disableAssistantForTicket(userId, issueKey, reason);
  }

  async enable(userId: number, issueKey: string): Promise<void> {
    await userTicketDisableService.enableAssistantForTicket(userId, issueKey);
  }

  async isDisabled(userId: number, issueKey: string): Promise<boolean> {
    return userTicketDisableService.isTicketDisabled(userId, issueKey);
  }

  async getInfo(userId: number, issueKey: string): Promise<UserDisabledTicket | null> {
    return userTicketDisableService.getTicketInfo(userId, issueKey) as Promise<UserDisabledTicket | null>;
  }

  async listAll(userId: number): Promise<UserDisabledTicket[]> {
    return userTicketDisableService.getDisabledTickets(userId) as Promise<UserDisabledTicket[]>;
  }
}
