import { ConversationRepositoryPort } from '../domain/interfaces/conversation-repository.port';
import { SwitchToServiceUseCase } from './switch-to-service.use-case';

/**
 * Interactive reply: customer tapped a button or list item.
 * The id is the serviceId set when building the interactive message.
 */
export class HandleInteractiveReplyUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryPort,
    private readonly switchToService: SwitchToServiceUseCase,
    private readonly defaultUserId: number
  ) {}

  async execute(
    phone: string,
    senderName: string,
    serviceId: string,
    serviceName: string,
    phoneNumberId: string,
    msgId: string
  ): Promise<void> {
    if (!this.defaultUserId) return;

    const conv = await this.conversationRepository.getOrCreateConversation(
      phone, phoneNumberId, this.defaultUserId
    );

    if (await this.conversationRepository.isMessageProcessed(phone, msgId)) return;
    await this.conversationRepository.markMessageProcessed(phone, msgId);

    // Already active → ignore stale interactive reply
    if (conv.state === 'active') return;

    console.log(`📱 [WhatsApp] Interactive tap: ${phone} → service "${serviceName}" (${serviceId})`);

    await this.switchToService.execute(
      phone, senderName, serviceName,
      { serviceId, serviceName },
      phoneNumberId, conv
    );
  }
}
