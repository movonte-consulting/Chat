export interface ChatbotAssistantResponse {
  success: boolean;
  threadId: string;
  response?: string;
  error?: string;
  assistantId?: string;
  assistantName?: string;
}
