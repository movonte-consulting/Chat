import { UserConfigurationService } from '../../../../../services/user_configuration_service';
import { UserDisabledTicket } from '../../../domain/modelos/user-disabled-ticket.model';
import { UserTicketToggleRegistryPort } from '../../../domain/interfaces/user/user-ticket-toggle-registry.port';

export class UserTicketToggleRegistryAdapter implements UserTicketToggleRegistryPort {
  async disable(userId: number, issueKey: string, reason: string): Promise<void> {
    await UserConfigurationService.getInstance(userId).disableAssistantForTicket(issueKey, reason);
  }

  async enable(userId: number, issueKey: string): Promise<void> {
    await UserConfigurationService.getInstance(userId).enableAssistantForTicket(issueKey);
  }

  async isDisabled(userId: number, issueKey: string): Promise<boolean> {
    return UserConfigurationService.getInstance(userId).isTicketDisabled(issueKey);
  }

  async getInfo(userId: number, issueKey: string): Promise<UserDisabledTicket | null> {
    return UserConfigurationService.getInstance(userId).getTicketInfo(issueKey) as Promise<UserDisabledTicket | null>;
  }

  async listAll(userId: number): Promise<UserDisabledTicket[]> {
    return UserConfigurationService.getInstance(userId).getDisabledTickets() as Promise<UserDisabledTicket[]>;
  }
}
