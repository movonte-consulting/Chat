import { UserDisabledTicket } from '../../modelos/user-disabled-ticket.model';

export interface UserTicketToggleRegistryPort {
  disable(userId: number, issueKey: string, reason: string): Promise<void>;
  enable(userId: number, issueKey: string): Promise<void>;
  isDisabled(userId: number, issueKey: string): Promise<boolean>;
  getInfo(userId: number, issueKey: string): Promise<UserDisabledTicket | null>;
  listAll(userId: number): Promise<UserDisabledTicket[]>;
}
