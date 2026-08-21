import { ConversationRepositoryPort } from '../domain/interfaces/conversation-repository.port';
import { WhatsAppSenderPort } from '../domain/interfaces/whatsapp-sender.port';

/**
 * Bridge used by the chatbot feature: after a Jira webhook produces an AI
 * response, forward it to WhatsApp if the issue is linked to an active
 * WhatsApp conversation. No-op if there's no linked conversation.
 */
export class NotifyFromJiraUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryPort,
    private readonly whatsappSender: WhatsAppSenderPort
  ) {}

  async execute(issueKey: string, text: string): Promise<void> {
    const conversation = await this.conversationRepository.findByIssueKey(issueKey);
    if (conversation?.phone_number_id) {
      await this.whatsappSender.sendText(conversation.phone_number_id, conversation.phone_number, text);
      console.log(`📱 Respuesta de IA enviada a WhatsApp: ${conversation.phone_number}`);
    }
  }
}
