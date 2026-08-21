import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';
import { ChatbotAssistantResponse } from '../domain/modelos/chatbot-response.model';

export class HandleServiceChatUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(serviceId: string, message: string, threadId?: string): Promise<ChatbotAssistantResponse> {
    return this.chat.processChatForService(message, serviceId, threadId);
  }
}
