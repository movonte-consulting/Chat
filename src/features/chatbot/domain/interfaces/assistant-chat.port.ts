import { ChatbotAssistantResponse } from '../modelos/chatbot-response.model';

export interface AssistantChatPort {
  processForUserService(
    userId: number,
    openaiToken: string,
    message: string,
    serviceId: string,
    threadId: string,
    context?: any
  ): Promise<ChatbotAssistantResponse>;
}
