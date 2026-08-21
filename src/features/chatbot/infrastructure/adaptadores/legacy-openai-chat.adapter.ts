/** Envuelve OpenAIService (791 líneas, no migrado — fuera de alcance de esta migración). */

import { OpenAIService } from '../../../../services/openAI_service';
import {
  ActiveThreadInfo,
  AssistantInfo,
  LegacyOpenAIChatPort,
  ThreadHistoryResult
} from '../../domain/interfaces/legacy-openai-chat.port';
import { ChatbotAssistantResponse } from '../../domain/modelos/chatbot-response.model';

export class LegacyOpenAIChatAdapter implements LegacyOpenAIChatPort {
  constructor(private readonly openaiService: OpenAIService) {}

  processDirectChat(message: string, threadId?: string, context?: any): Promise<ChatbotAssistantResponse> {
    return this.openaiService.processDirectChat(message, threadId, context);
  }

  processJiraChatMessage(message: string, issueKey?: string, userInfo?: any): Promise<ChatbotAssistantResponse> {
    return this.openaiService.processJiraChatMessage(message, issueKey, userInfo);
  }

  async getThreadHistory(threadId: string): Promise<ThreadHistoryResult> {
    return this.openaiService.getThreadHistory(threadId) as any;
  }

  getActiveThreads(): ActiveThreadInfo[] {
    return this.openaiService.getActiveThreads() as any;
  }

  async listAssistants(): Promise<AssistantInfo[]> {
    return this.openaiService.listAssistants() as any;
  }

  setActiveAssistant(assistantId: string): void {
    this.openaiService.setActiveAssistant(assistantId);
  }

  getActiveAssistant(): string {
    return this.openaiService.getActiveAssistant();
  }

  processChatForService(message: string, serviceId: string, threadId?: string, context?: any): Promise<ChatbotAssistantResponse> {
    return this.openaiService.processChatForService(message, serviceId, threadId, context);
  }
}
