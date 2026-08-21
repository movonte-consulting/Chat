import * as userTicketDisableService from '../../../../services/user_ticket_disable_service';
import { TicketDisableInfo, UserTicketTogglePort } from '../../domain/interfaces/user-ticket-toggle.port';

export class UserTicketToggleAdapter implements UserTicketTogglePort {
  async isDisabled(userId: number, issueKey: string): Promise<boolean> {
    return userTicketDisableService.isTicketDisabled(userId, issueKey);
  }

  async getDisableInfo(userId: number, issueKey: string): Promise<TicketDisableInfo | null> {
    const info = await userTicketDisableService.getTicketInfo(userId, issueKey);
    return info ? { reason: (info as any).reason, disabledAt: (info as any).disabledAt } : null;
  }
}
