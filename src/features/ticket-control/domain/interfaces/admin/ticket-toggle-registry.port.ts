import { DisabledTicket } from '../../modelos/disabled-ticket.model';

export interface TicketToggleRegistryPort {
  /** No se espera intencionalmente en los use cases — ver nota en el plan (fire-and-forget seguro). */
  disable(issueKey: string, reason: string): Promise<void>;
  enable(issueKey: string): Promise<void>;
  isDisabled(issueKey: string): boolean;
  getInfo(issueKey: string): DisabledTicket | null;
  listAll(): DisabledTicket[];
}
