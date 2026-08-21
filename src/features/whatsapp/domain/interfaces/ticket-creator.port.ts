export interface TicketCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface TicketCreatorPort {
  createTicket(
    userId: number,
    serviceId: string,
    customerInfo: TicketCustomerInfo
  ): Promise<{ issueKey: string }>;
}
