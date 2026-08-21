/** Crea tickets de WhatsApp delegando al feature tickets (createTicketForWhatsApp). */

import { createTicketForWhatsApp } from '../../../../features/tickets';
import { TicketCreatorPort, TicketCustomerInfo } from '../../domain/interfaces/ticket-creator.port';

export class TicketCreatorAdapter implements TicketCreatorPort {
  async createTicket(
    userId: number,
    serviceId: string,
    customerInfo: TicketCustomerInfo
  ): Promise<{ issueKey: string }> {
    return createTicketForWhatsApp(userId, serviceId, customerInfo);
  }
}
