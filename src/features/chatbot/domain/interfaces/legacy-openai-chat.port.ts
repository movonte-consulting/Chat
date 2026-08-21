import { ChatbotAssistantResponse } from '../modelos/chatbot-response.model';

export interface ThreadHistoryResult {
  success: boolean;
  threadId: string;
  messages: { role: string; content: string; timestamp: Date }[];
}

export interface ActiveThreadInfo {
  key: string;
  threadId: string;
  jiraIssueKey?: string;
  lastActivity: Date;
  messageCount: number;
}

export interface AssistantInfo {
  id: string;
  name: string;
  description?: string;
  model: string;
  created_at: number;
}

/** Envuelve OpenAIService (791 líneas, no migrado — fuera de alcance de esta migración). */
export interface LegacyOpenAIChatPort {
  processDirectChat(message: string, threadId?: string, context?: any): Promise<ChatbotAssistantResponse>;
  processJiraChatMessage(message: string, issueKey?: string, userInfo?: any): Promise<ChatbotAssistantResponse>;
  getThreadHistory(threadId: string): Promise<ThreadHistoryResult>;
  getActiveThreads(): ActiveThreadInfo[];
  listAssistants(): Promise<AssistantInfo[]>;
  setActiveAssistant(assistantId: string): void;
  getActiveAssistant(): string;
  processChatForService(message: string, serviceId: string, threadId?: string, context?: any): Promise<ChatbotAssistantResponse>;
}
