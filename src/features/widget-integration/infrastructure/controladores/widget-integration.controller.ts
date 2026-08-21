import { Request, Response } from 'express';
import { ConnectToTicketUseCase } from '../../application/connect-to-ticket.use-case';
import { SendMessageToJiraUseCase } from '../../application/send-message-to-jira.use-case';
import { GetConversationHistoryUseCase } from '../../application/get-conversation-history.use-case';
import { SearchTicketsByEmailUseCase } from '../../application/search-tickets-by-email.use-case';
import { UpdateTicketStatusUseCase } from '../../application/update-ticket-status.use-case';
import { GetTicketDetailsUseCase } from '../../application/get-ticket-details.use-case';
import { CheckNewMessagesUseCase } from '../../application/check-new-messages.use-case';
import { HealthCheckUseCase } from '../../application/health-check.use-case';
import { CheckAssistantStatusUseCase } from '../../application/check-assistant-status.use-case';

export class WidgetIntegrationController {
  constructor(
    private readonly connectToTicketUseCase: ConnectToTicketUseCase,
    private readonly sendMessageToJiraUseCase: SendMessageToJiraUseCase,
    private readonly getConversationHistoryUseCase: GetConversationHistoryUseCase,
    private readonly searchTicketsByEmailUseCase: SearchTicketsByEmailUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private readonly getTicketDetailsUseCase: GetTicketDetailsUseCase,
    private readonly checkNewMessagesUseCase: CheckNewMessagesUseCase,
    private readonly healthCheckUseCase: HealthCheckUseCase,
    private readonly checkAssistantStatusUseCase: CheckAssistantStatusUseCase
  ) {}

  async connectToTicket(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, customerInfo, serviceId } = req.body;
      const result = await this.connectToTicketUseCase.execute(req.user!.id, issueKey, customerInfo, serviceId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'no_widget_account') {
        res.status(424).json({
          success: false,
          error: `El servicio "${result.serviceId}" no tiene una cuenta de Jira configurada para el widget. Configúrala en el dashboard antes de conectar tickets.`
        });
        return;
      }
      if (result.kind === 'ticket_not_found') {
        res.status(404).json({ success: false, error: 'Ticket not found' });
        return;
      }

      res.json({
        success: true,
        issue: {
          key: issueKey,
          summary: result.issue.fields.summary,
          status: result.issue.fields.status.name,
          url: `${result.jiraUrl}/browse/${issueKey}`
        },
        conversationHistory: result.conversationHistory,
        message: 'Widget connected successfully to Jira ticket'
      });
    } catch (error) {
      console.error('Error connecting widget to ticket:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async sendMessageToJira(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, message, customerInfo, serviceId } = req.body;
      const result = await this.sendMessageToJiraUseCase.execute(req.user!.id, issueKey, message, customerInfo, serviceId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'no_widget_account') {
        res.status(424).json({
          success: false,
          error: `El servicio "${result.serviceId}" no tiene una cuenta de Jira configurada para el widget. Configúrala en el dashboard antes de enviar mensajes.`
        });
        return;
      }
      if (result.kind === 'ai_disabled') {
        res.json({
          success: true,
          message: 'Message sent to Jira, but AI assistant is disabled for this ticket',
          aiDisabled: true,
          disabledInfo: {
            reason: result.disabledInfo?.reason || 'No reason provided',
            disabledAt: result.disabledInfo?.disabledAt,
            disabledBy: result.disabledInfo?.disabledBy
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Message sent to Jira successfully. AI response will come via webhook.',
        aiResponse: null,
        threadId: `widget_${issueKey}`
      });
    } catch (error) {
      console.error('Error sending message to Jira:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;
      const result = await this.getConversationHistoryUseCase.execute(issueKey);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, issueKey, conversationHistory: result.data });
    } catch (error) {
      console.error('Error getting conversation history:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async searchTicketsByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;
      const result = await this.searchTicketsByEmailUseCase.execute(email);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, email, tickets: result.tickets });
    } catch (error) {
      console.error('Error searching tickets by email:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;
      const { status } = req.body;
      const result = await this.updateTicketStatusUseCase.execute(issueKey, status);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: `Ticket ${issueKey} status updated to ${status}` });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getTicketDetails(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;
      const result = await this.getTicketDetailsUseCase.execute(issueKey);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      const issue = result.issue;
      res.json({
        success: true,
        issue: {
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name,
          created: issue.fields.created,
          updated: issue.fields.updated,
          url: `${process.env.JIRA_BASE_URL}/browse/${issueKey}`
        }
      });
    } catch (error) {
      console.error('Error getting ticket details:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async checkNewMessages(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, lastMessageId } = req.query;
      const result = await this.checkNewMessagesUseCase.execute(issueKey, lastMessageId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        issueKey,
        newMessages: result.newMessages,
        hasNewMessages: result.hasNewMessages,
        lastMessageId: result.lastMessageId,
        totalMessages: result.totalMessages
      });
    } catch (error) {
      console.error('Error checking for new messages:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      await this.healthCheckUseCase.execute();

      res.json({
        success: true,
        message: 'Widget integration is healthy',
        timestamp: new Date().toISOString(),
        services: { jira: 'connected', openai: 'available' }
      });
    } catch (error) {
      console.error('Widget integration health check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Widget integration health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkAssistantStatus(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.query;
      const result = this.checkAssistantStatusUseCase.execute(issueKey);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        issueKey,
        isDisabled: result.isDisabled,
        disabledInfo: result.disabledInfo
          ? { reason: result.disabledInfo.reason, disabledAt: result.disabledInfo.disabledAt, disabledBy: result.disabledInfo.disabledBy }
          : null
      });
    } catch (error) {
      console.error('Error checking assistant status:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
