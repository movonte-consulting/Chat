export interface WebhookPayload {
  issueKey: string;
  message: string;
  author: string;
  timestamp: string;
  source: 'jira-comment' | 'widget-message';
  threadId: string;
  assistantId?: string;
  assistantName?: string;
  response?: string;
  context?: any;
}

export interface WebhookSendResult {
  success: boolean;
  error?: string;
}
