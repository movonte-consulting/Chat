import { UserWebhookRecord } from './user-webhook-lookup.port';

export interface WebhookDispatchPayload {
  userId: number;
  serviceId: string;
  issueKey: string;
  authorName: string;
  originalMessage: string;
  timestamp: string;
  issue?: any;
  comment?: any;
  assistantResponse: string;
  jiraIssueKey: string;
  issueSummary?: string;
  issueStatus?: string;
  conversationHistory: any[];
  previousResponses: any[];
}

export interface UserWebhookDispatcherPort {
  dispatch(webhook: UserWebhookRecord, payload: WebhookDispatchPayload): Promise<{ success: boolean; error?: string; skipped?: boolean }>;
}
