import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';
import { ChatbotAssistantResponse } from '../domain/modelos/chatbot-response.model';

export class HandleDirectChatUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(message: string, threadId?: string, context?: any): Promise<ChatbotAssistantResponse> {
    return this.chat.processDirectChat(message, threadId, context);
  }
}
