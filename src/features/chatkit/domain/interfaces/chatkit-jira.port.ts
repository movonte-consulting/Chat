import { ChatKitJiraResponse } from '../modelos/chatkit-jira-response.model';

export interface ChatKitJiraPort {
  createSessionForTicket(issueKey: string, userInfo?: any): Promise<{ id: string }>;
  processWidgetMessage(issueKey: string, message: string, customerInfo: any): Promise<ChatKitJiraResponse>;
  processJiraComment(issueKey: string, comment: string, authorInfo: any): Promise<ChatKitJiraResponse>;
  hasActiveSession(issueKey: string): boolean;
}
