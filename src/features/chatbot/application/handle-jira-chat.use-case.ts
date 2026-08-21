import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';
import { ChatbotAssistantResponse } from '../domain/modelos/chatbot-response.model';

export class HandleJiraChatUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(message: string, issueKey?: string, userInfo?: any): Promise<ChatbotAssistantResponse> {
    return this.chat.processJiraChatMessage(message, issueKey, userInfo);
  }
}
