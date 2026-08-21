import { ConfigurationService } from '../../../../services/configuration_service';
import { TicketDisableRegistryPort } from '../../domain/interfaces/ticket-disable-registry.port';
import { DisabledTicketInfo } from '../../domain/modelos/disabled-ticket-info.model';

export class TicketDisableRegistryAdapter implements TicketDisableRegistryPort {
  private readonly configService: ConfigurationService;

  constructor() {
    this.configService = ConfigurationService.getInstance();
  }

  isTicketDisabled(issueKey: string): boolean {
    return this.configService.isTicketDisabled(issueKey);
  }

  getDisabledTicketInfo(issueKey: string): DisabledTicketInfo | null {
    return this.configService.getDisabledTicketInfo(issueKey);
  }
}
