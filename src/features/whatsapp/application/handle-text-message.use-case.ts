import { ConversationRepositoryPort } from '../domain/interfaces/conversation-repository.port';
import { WhatsAppSenderPort } from '../domain/interfaces/whatsapp-sender.port';
import { RoutableServiceProviderPort } from '../domain/interfaces/routable-service-provider.port';
import { isResetKeyword, parseServiceSelection } from '../domain/modelos/intent-router.model';
import { SwitchToServiceUseCase } from './switch-to-service.use-case';
import { RespondWithGenericAgentUseCase } from './respond-with-generic-agent.use-case';
import { AddMessageToTicketUseCase } from './add-message-to-ticket.use-case';

/** Core text message dispatcher: reset keyword, phase 2 (active ticket) or phase 1 (selection). */
export class HandleTextMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryPort,
    private readonly routableServiceProvider: RoutableServiceProviderPort,
    private readonly whatsappSender: WhatsAppSenderPort,
    private readonly switchToService: SwitchToServiceUseCase,
    private readonly respondWithGenericAgent: RespondWithGenericAgentUseCase,
    private readonly addMessageToTicket: AddMessageToTicketUseCase,
    private readonly defaultUserId: number
  ) {}

  async execute(
    phone: string,
    senderName: string,
    text: string,
    phoneNumberId: string,
    msgId: string
  ): Promise<void> {
    if (!this.defaultUserId) {
      console.warn('⚠️ WhatsApp: WHATSAPP_DEFAULT_USER_ID not set. Skipping.');
      return;
    }

    const conv = await this.conversationRepository.getOrCreateConversation(
      phone, phoneNumberId, this.defaultUserId
    );

    if (await this.conversationRepository.isMessageProcessed(phone, msgId)) {
      console.log(`[WhatsApp] Duplicate msg ${msgId} ignored for ${phone}`);
      return;
    }
    await this.conversationRepository.markMessageProcessed(phone, msgId);

    // Reset keyword → volver al menú de servicios
    if (isResetKeyword(text)) {
      await this.conversationRepository.resetConversation(phone);
      const services = await this.routableServiceProvider.getRoutableServices(this.defaultUserId);
      if (phoneNumberId && services.length > 0) {
        await this.whatsappSender.sendInteractiveServices(phoneNumberId, phone, services);
      }
      return;
    }

    // ── PHASE 2: active ───────────────────────────────────────────────────
    if (conv.state === 'active' && conv.issue_key && conv.service_id) {
      console.log(`📱 [WhatsApp] Active → ${conv.issue_key}`);
      await this.addMessageToTicket.execute(
        senderName, text, conv.issue_key, conv.service_id, conv.user_id
      );
      return;
    }

    // ── PHASE 1: pre_selection ────────────────────────────────────────────
    const services = await this.routableServiceProvider.getRoutableServices(this.defaultUserId);

    if (services.length === 0) {
      if (phoneNumberId) {
        await this.whatsappSender.sendText(phoneNumberId, phone, 'No hay servicios disponibles en este momento.');
      }
      return;
    }

    // Typed number or exact service name
    const selection = parseServiceSelection(services, text, true);
    if (selection) {
      await this.switchToService.execute(phone, senderName, text, selection, phoneNumberId, conv);
      return;
    }

    // Generic agent (conversational + function calling)
    await this.respondWithGenericAgent.execute(phone, senderName, text, services, phoneNumberId, conv);
  }
}
