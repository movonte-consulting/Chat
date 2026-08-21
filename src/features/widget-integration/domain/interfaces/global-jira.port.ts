import { JiraCredentials } from '../modelos/jira-credentials.model';

export interface GlobalJiraPort {
  getIssueByKey(issueKey: string): Promise<any>;
  createChatSession(issueKey: string, customerInfo: { name: string; email: string }, credentials?: JiraCredentials): Promise<any>;
  getConversationHistory(issueKey: string, credentials?: JiraCredentials): Promise<any[]>;
  searchIssuesByEmail(email: string): Promise<any>;
  updateIssueStatus(issueKey: string, statusName: string): Promise<any>;
  getIssueComments(issueKey: string): Promise<any>;
  testConnection(): Promise<any>;
}
