import { ConversationRepositoryPort } from '../domain/interfaces/conversation-repository.port';
import { WhatsAppSenderPort } from '../domain/interfaces/whatsapp-sender.port';
import { TicketCreatorPort } from '../domain/interfaces/ticket-creator.port';
import { ServiceSelection } from '../domain/modelos/intent-router.model';
import { AddMessageToTicketUseCase } from './add-message-to-ticket.use-case';

/** Phase 1 → Phase 2 transition: creates the Jira ticket and activates the conversation. */
export class SwitchToServiceUseCase {
  constructor(
    private readonly ticketCreator: TicketCreatorPort,
    private readonly conversationRepository: ConversationRepositoryPort,
    private readonly whatsappSender: WhatsAppSenderPort,
    private readonly addMessageToTicket: AddMessageToTicketUseCase
  ) {}

  async execute(
    phone: string,
    senderName: string,
    text: string,
    selection: ServiceSelection,
    phoneNumberId: string,
    conv: { user_id: number },
    confirmationText?: string
  ): Promise<void> {
    const userId = conv.user_id;
    const customerInfo = {
      name: senderName,
      email: `${phone.replace(/\D/g, '')}@whatsapp.placeholder`,
      phone
    };

    try {
      const result = await this.ticketCreator.createTicket(userId, selection.serviceId, customerInfo);

      await this.conversationRepository.activateConversation(phone, result.issueKey, selection.serviceId);

      console.log(`📱 [WhatsApp] ${phone} → "${selection.serviceName}" → ticket ${result.issueKey}`);

      if (phoneNumberId) {
        const msg =
          confirmationText ||
          `✅ Te hemos conectado con *${selection.serviceName}*.\n\nUn agente te atenderá en breve. ¿En qué podemos ayudarte?`;
        await this.whatsappSender.sendText(phoneNumberId, phone, msg);
      }

      const firstComment = `Usuario conectado al servicio: ${selection.serviceName}. Mensaje: ${text}`;
      await this.addMessageToTicket.execute(
        senderName, firstComment, result.issueKey, selection.serviceId, userId
      );
    } catch (err) {
      console.error('❌ WhatsApp: failed to create ticket:', err);
      if (phoneNumberId) {
        await this.whatsappSender.sendText(
          phoneNumberId, phone,
          'No pudimos conectar con ese servicio. Por favor intenta de nuevo.'
        );
      }
    }
  }
}
