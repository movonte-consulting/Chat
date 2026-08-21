export interface ChatResult {
  success: boolean;
  response?: string;
  threadId?: string;
  assistantId?: string;
  assistantName?: string;
  error?: string;
}
