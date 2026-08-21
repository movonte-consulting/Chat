import { UserOpenAIService } from '../../../../services/user_openai_service';
import { AssistantChatPort } from '../../domain/interfaces/assistant-chat.port';
import { ChatbotAssistantResponse } from '../../domain/modelos/chatbot-response.model';

export class AssistantChatAdapter implements AssistantChatPort {
  async processForUserService(
    userId: number,
    openaiToken: string,
    message: string,
    serviceId: string,
    threadId: string,
    context?: any
  ): Promise<ChatbotAssistantResponse> {
    const userOpenAIService = new UserOpenAIService(userId, openaiToken);
    return userOpenAIService.processChatForService(message, serviceId, threadId, context);
  }
}
