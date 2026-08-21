import { UserConfigurationService } from '../../../../services/user_configuration_service';
import { TicketDisableInfo, UserTicketTogglePort } from '../../domain/interfaces/user-ticket-toggle.port';

export class UserTicketToggleAdapter implements UserTicketTogglePort {
  async isDisabled(userId: number, issueKey: string): Promise<boolean> {
    const service = UserConfigurationService.getInstance(userId);
    return service.isTicketDisabled(issueKey);
  }

  async getDisableInfo(userId: number, issueKey: string): Promise<TicketDisableInfo | null> {
    const service = UserConfigurationService.getInstance(userId);
    const info = await service.getTicketInfo(issueKey);
    return info ? { reason: (info as any).reason, disabledAt: (info as any).disabledAt } : null;
  }
}
