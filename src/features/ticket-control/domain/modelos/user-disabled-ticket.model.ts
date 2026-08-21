/** user_ticket_disable_service.getDisabledTickets() devuelve disabledAt como string ISO, no Date. */
export interface UserDisabledTicket {
  issueKey: string;
  reason: string;
  disabledAt: string;
  disabledBy: string;
}
