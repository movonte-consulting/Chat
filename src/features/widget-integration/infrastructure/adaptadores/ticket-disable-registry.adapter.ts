import { TicketDisableRegistry } from '../../../../services/ticket_disable_registry';
import { TicketDisableRegistryPort } from '../../domain/interfaces/ticket-disable-registry.port';
import { DisabledTicketInfo } from '../../domain/modelos/disabled-ticket-info.model';

export class TicketDisableRegistryAdapter implements TicketDisableRegistryPort {
  private readonly configService: TicketDisableRegistry;

  constructor() {
    this.configService = TicketDisableRegistry.getInstance();
  }

  isTicketDisabled(issueKey: string): boolean {
    return this.configService.isTicketDisabled(issueKey);
  }

  getDisabledTicketInfo(issueKey: string): DisabledTicketInfo | null {
    return this.configService.getDisabledTicketInfo(issueKey);
  }
}
