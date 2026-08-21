import { JiraService } from '../../../../services/jira_service';
import { GlobalJiraPort } from '../../domain/interfaces/global-jira.port';
import { JiraCredentials } from '../../domain/modelos/jira-credentials.model';

export class GlobalJiraAdapter implements GlobalJiraPort {
  private readonly jiraService: JiraService;

  constructor() {
    this.jiraService = JiraService.getInstance();
  }

  async getIssueByKey(issueKey: string): Promise<any> {
    return this.jiraService.getIssueByKey(issueKey);
  }

  async createChatSession(issueKey: string, customerInfo: { name: string; email: string }, credentials?: JiraCredentials): Promise<any> {
    return this.jiraService.createChatSession(issueKey, customerInfo, credentials);
  }

  async getConversationHistory(issueKey: string, credentials?: JiraCredentials): Promise<any[]> {
    return this.jiraService.getConversationHistory(issueKey, credentials);
  }

  async searchIssuesByEmail(email: string): Promise<any> {
    return this.jiraService.searchIssuesByEmail(email);
  }

  async updateIssueStatus(issueKey: string, statusName: string): Promise<any> {
    return this.jiraService.updateIssueStatus(issueKey, statusName);
  }

  async getIssueComments(issueKey: string): Promise<any> {
    return this.jiraService.getIssueComments(issueKey);
  }

  async testConnection(): Promise<any> {
    return this.jiraService.testConnection();
  }
}
