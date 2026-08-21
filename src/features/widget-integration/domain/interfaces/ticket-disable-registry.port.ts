import { DisabledTicketInfo } from '../modelos/disabled-ticket-info.model';

export interface TicketDisableRegistryPort {
  isTicketDisabled(issueKey: string): boolean;
  getDisabledTicketInfo(issueKey: string): DisabledTicketInfo | null;
}
