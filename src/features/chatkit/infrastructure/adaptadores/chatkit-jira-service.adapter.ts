import { ChatKitJiraService } from '../../../../services/chatkit_jira_service';
import { ChatKitJiraPort } from '../../domain/interfaces/chatkit-jira.port';
import { ChatKitJiraResponse } from '../../domain/modelos/chatkit-jira-response.model';

export class ChatKitJiraServiceAdapter implements ChatKitJiraPort {
  private readonly chatkitJiraService: ChatKitJiraService;

  constructor() {
    this.chatkitJiraService = new ChatKitJiraService();
  }

  async createSessionForTicket(issueKey: string, userInfo?: any): Promise<{ id: string }> {
    return this.chatkitJiraService.createSessionForTicket(issueKey, userInfo);
  }

  async processWidgetMessage(issueKey: string, message: string, customerInfo: any): Promise<ChatKitJiraResponse> {
    return this.chatkitJiraService.processWidgetMessage(issueKey, message, customerInfo);
  }

  async processJiraComment(issueKey: string, comment: string, authorInfo: any): Promise<ChatKitJiraResponse> {
    return this.chatkitJiraService.processJiraComment(issueKey, comment, authorInfo);
  }

  hasActiveSession(issueKey: string): boolean {
    return this.chatkitJiraService.hasActiveSession(issueKey);
  }
}
