export interface TicketDisableInfo {
  reason?: string;
  disabledAt?: string;
}

export interface UserTicketTogglePort {
  isDisabled(userId: number, issueKey: string): Promise<boolean>;
  getDisableInfo(userId: number, issueKey: string): Promise<TicketDisableInfo | null>;
}
