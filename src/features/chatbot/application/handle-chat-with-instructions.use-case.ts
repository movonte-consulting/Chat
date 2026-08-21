import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';
import { ChatbotAssistantResponse } from '../domain/modelos/chatbot-response.model';

export class HandleChatWithInstructionsUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(
    message: string,
    threadId: string | undefined,
    context: any,
    userRole: any,
    projectInfo: any,
    specificInstructions: any
  ): Promise<ChatbotAssistantResponse> {
    const enrichedContext = { ...context, userRole, projectInfo, specificInstructions };
    return this.chat.processDirectChat(message, threadId, enrichedContext);
  }
}
