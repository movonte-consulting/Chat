/**
 * Controller del feature chatbot. Valida el wire-format del webhook de Jira (content-length,
 * body vacío, webhookEvent/issue faltante — formato HTTP, no negocio) y despacha por evento;
 * los demás 12 handlers son delgados y delegan directo al use case correspondiente.
 */

import { Request, Response } from 'express';
import { JiraWebhookPayload } from '../../../../types';
import { RecordWebhookReceivedUseCase } from '../../application/record-webhook-received.use-case';
import { RecordWebhookErrorUseCase } from '../../application/record-webhook-error.use-case';
import { ProcessCommentCreatedUseCase } from '../../application/process-comment-created.use-case';
import { HandleStatusChangeUseCase } from '../../application/handle-status-change.use-case';
import { HandleIssueCreatedUseCase } from '../../application/handle-issue-created.use-case';
import { HandleDirectChatUseCase } from '../../application/handle-direct-chat.use-case';
import { HandleChatWithInstructionsUseCase } from '../../application/handle-chat-with-instructions.use-case';
import { HandleJiraChatUseCase } from '../../application/handle-jira-chat.use-case';
import { GetThreadHistoryUseCase } from '../../application/get-thread-history.use-case';
import { ListActiveThreadsUseCase } from '../../application/list-active-threads.use-case';
import { ListAssistantsUseCase } from '../../application/list-assistants.use-case';
import { SetActiveAssistantUseCase } from '../../application/set-active-assistant.use-case';
import { GetActiveAssistantUseCase } from '../../application/get-active-assistant.use-case';
import { HandleServiceChatUseCase } from '../../application/handle-service-chat.use-case';
import { GetConversationReportUseCase } from '../../application/get-conversation-report.use-case';
import { GetWebhookStatsUseCase } from '../../application/get-webhook-stats.use-case';
import { ResetWebhookStatsUseCase } from '../../application/reset-webhook-stats.use-case';

export class ChatbotController {
  constructor(
    private readonly recordWebhookReceived: RecordWebhookReceivedUseCase,
    private readonly recordWebhookError: RecordWebhookErrorUseCase,
    private readonly processCommentCreated: ProcessCommentCreatedUseCase,
    private readonly handleStatusChange: HandleStatusChangeUseCase,
    private readonly handleIssueCreated: HandleIssueCreatedUseCase,
    private readonly handleDirectChatUseCase: HandleDirectChatUseCase,
    private readonly handleChatWithInstructionsUseCase: HandleChatWithInstructionsUseCase,
    private readonly handleJiraChatUseCase: HandleJiraChatUseCase,
    private readonly getThreadHistoryUseCase: GetThreadHistoryUseCase,
    private readonly listActiveThreadsUseCase: ListActiveThreadsUseCase,
    private readonly listAssistantsUseCase: ListAssistantsUseCase,
    private readonly setActiveAssistantUseCase: SetActiveAssistantUseCase,
    private readonly getActiveAssistantUseCase: GetActiveAssistantUseCase,
    private readonly handleServiceChatUseCase: HandleServiceChatUseCase,
    private readonly getConversationReportUseCase: GetConversationReportUseCase,
    private readonly getWebhookStatsUseCase: GetWebhookStatsUseCase,
    private readonly resetWebhookStatsUseCase: ResetWebhookStatsUseCase
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // POST /webhook/jira
  // ─────────────────────────────────────────────────────────────────────────
  async handleJiraWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log('\n🔍 === WEBHOOK DEBUG INFO ===');
      console.log('📋 Headers recibidos:', JSON.stringify(req.headers, null, 2));
      console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('🌐 URL:', req.url);
      console.log('📝 Method:', req.method);
      console.log('🔗 Origin:', req.get('origin') || 'No origin');
      console.log('👤 User-Agent:', req.get('user-agent') || 'No user-agent');
      console.log('📏 Content-Length header:', req.get('content-length') || 'N/A');

      const contentLength = req.get('content-length');
      if (contentLength === '0' || contentLength === '') {
        console.log(`⚠️ WEBHOOK CON CONTENT-LENGTH 0 - Probablemente un webhook de prueba/ping de Jira`);
        res.status(200).json({ success: true, message: 'Webhook recibido (content-length 0 - posible ping de prueba)' });
        return;
      }

      const payload: JiraWebhookPayload = req.body || {};
      this.recordWebhookReceived.execute();

      if (!payload || typeof payload !== 'object') {
        console.log(`⚠️ WEBHOOK SIN BODY VÁLIDO - Probablemente un webhook de prueba/ping de Jira`);
        res.status(200).json({ success: true, message: 'Webhook recibido (sin body válido - posible ping de prueba)' });
        return;
      }

      const hasContent = Object.keys(payload).length > 0;
      if (!hasContent) {
        console.log(`⚠️ WEBHOOK CON BODY VACÍO - Probablemente un webhook de prueba/ping de Jira`);
        res.status(200).json({ success: true, message: 'Webhook recibido (body vacío - posible ping de prueba)' });
        return;
      }

      if (!payload.webhookEvent) {
        console.log(`⚠️ WEBHOOK SIN webhookEvent - Ignorando`);
        res.status(200).json({ success: true, message: 'Webhook recibido (sin evento)' });
        return;
      }

      const eventsRequiringIssue = ['comment_created', 'jira:issue_created', 'jira:issue_updated'];
      if (eventsRequiringIssue.includes(payload.webhookEvent)) {
        if (!payload.issue || !payload.issue.key) {
          console.log(`⚠️ WEBHOOK SIN issue/issue.key para evento ${payload.webhookEvent} - Ignorando`);
          res.status(200).json({ success: true, message: 'Webhook recibido (sin issue requerido)' });
          return;
        }
      }

      console.log(`\n📥 WEBHOOK RECIBIDO`);
      console.log(`   Evento: ${payload.webhookEvent}`);
      console.log(`   Issue: ${payload.issue?.key || 'N/A'}`);
      console.log(`   Usuario: ${payload.comment?.author?.displayName || 'N/A'}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);

      if (payload.webhookEvent === 'comment_created' && payload.comment) {
        if (!payload.issue || !payload.issue.key) {
          res.status(200).json({ success: true, message: 'Webhook recibido pero no se puede procesar sin issue key' });
          return;
        }

        const result = await this.processCommentCreated.execute(payload.issue, payload.comment);

        switch (result.kind) {
          case 'ignored':
            res.json({
              success: true,
              message: `Ticket ${result.issueKey} ignored - not from any active user service`,
              ignored: true,
              reason: 'no_matching_service'
            });
            break;
          case 'duplicate':
            res.json({ success: true, message: 'Comment already processed', duplicate: true });
            break;
          case 'ai_comment':
            res.json({ success: true, message: 'Skipped AI comment', aiComment: true });
            break;
          case 'widget_comment':
            res.json({ success: true, message: 'Skipped widget comment', widgetComment: true });
            break;
          case 'throttled':
            res.json({
              success: true,
              message: `Throttled - wait ${result.remainingSeconds}s`,
              throttled: true,
              remainingTime: result.remainingSeconds
            });
            break;
          case 'empty_comment':
            res.status(200).json({ success: true, message: 'Comentario vacío - no procesado' });
            break;
          case 'disabled':
            res.json({
              success: true,
              message: 'AI Assistant disabled for this ticket by user',
              disabled: true,
              reason: result.reason
            });
            break;
          case 'no_token':
            res.json({ success: false, error: 'Usuario no tiene token de OpenAI configurado' });
            break;
          case 'processed':
            res.json(result.response);
            break;
        }
      } else if (payload.webhookEvent === 'jira:issue_updated' && payload.changelog) {
        if (!payload.issue || !payload.issue.key) {
          res.status(200).json({ success: true, message: 'Webhook recibido pero no se puede procesar sin issue key' });
          return;
        }
        await this.handleStatusChange.execute(payload.issue, payload.changelog);
        res.json({ success: true, message: 'Status change processed' });
      } else if (payload.webhookEvent === 'jira:issue_created') {
        if (!payload.issue || !payload.issue.key) {
          res.status(200).json({ success: true, message: 'Webhook recibido pero no se puede procesar sin issue key' });
          return;
        }
        const result = await this.handleIssueCreated.execute(payload.issue);
        if (result.kind === 'ignored') {
          res.json({
            success: true,
            message: `Ticket ${result.issueKey} creation ignored - no matching user service`,
            ignored: true,
            reason: 'no_matching_service'
          });
        } else {
          res.json({
            success: true,
            message: 'Ticket creation processed',
            ticketKey: result.issueKey,
            isWebContact: result.isWebContact
          });
        }
      } else {
        console.log(`ℹ️  Evento ignorado: ${payload.webhookEvent}`);
        res.json({ success: true, message: 'Event processed but no action taken' });
      }
    } catch (error) {
      this.recordWebhookError.execute();
      console.error('❌ ERROR PROCESANDO WEBHOOK:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
      }
      res.status(500).json({
        success: false,
        error: 'Failed to process webhook',
        timestamp: new Date().toISOString(),
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /chat
  // ─────────────────────────────────────────────────────────────────────────
  async handleDirectChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, threadId, context } = req.body;
      console.log('🔵 handleDirectChat called:', { message: message?.substring(0, 50), threadId, context });

      if (!message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      const response = await this.handleDirectChatUseCase.execute(message, threadId, context);
      console.log('🔵 handleDirectChat response:', { success: response.success, threadId: response.threadId });
      res.json(response);
    } catch (error) {
      console.error('Error handling chat message:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /chat-with-instructions
  // ─────────────────────────────────────────────────────────────────────────
  async handleChatWithInstructions(req: Request, res: Response): Promise<void> {
    try {
      const { message, threadId, context, instructions, userRole, projectInfo, specificInstructions } = req.body;

      if (!message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      console.log('Chat with instructions request received:', {
        message, threadId, context: { ...context, userRole, projectInfo, specificInstructions }, instructions
      });

      const result = await this.handleChatWithInstructionsUseCase.execute(
        message, threadId, context, userRole, projectInfo, specificInstructions
      );
      res.json(result);
    } catch (error) {
      console.error('Error in chat with instructions endpoint:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /jira-chat
  // ─────────────────────────────────────────────────────────────────────────
  async handleJiraChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, issueKey, userInfo, context } = req.body;

      if (!message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      console.log('Jira chat request received:', { message, issueKey, userInfo, context });

      const result = await this.handleJiraChatUseCase.execute(message, issueKey, userInfo);
      res.json(result);
    } catch (error) {
      console.error('Error in Jira chat endpoint:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /thread/:threadId
  // ─────────────────────────────────────────────────────────────────────────
  async getThreadHistory(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const result = await this.getThreadHistoryUseCase.execute(threadId);
      res.json(result);
    } catch (error) {
      console.error('Error getting thread history:', error);
      res.status(500).json({ success: false, error: 'Failed to get thread history' });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /threads
  // ─────────────────────────────────────────────────────────────────────────
  async listActiveThreads(req: Request, res: Response): Promise<void> {
    try {
      const threads = this.listActiveThreadsUseCase.execute();
      res.json({ success: true, threads, count: threads.length });
    } catch (error) {
      console.error('Error listing threads:', error);
      res.status(500).json({ success: false, error: 'Failed to list threads' });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /webhook/stats
  // ─────────────────────────────────────────────────────────────────────────
  async getWebhookStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.getWebhookStatsUseCase.execute();
      res.json({ success: true, stats, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error getting webhook stats:', error);
      res.status(500).json({ success: false, error: 'Failed to get webhook stats' });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /webhook/reset
  // ─────────────────────────────────────────────────────────────────────────
  async resetWebhookStats(req: Request, res: Response): Promise<void> {
    try {
      this.resetWebhookStatsUseCase.execute();
      res.json({ success: true, message: 'Webhook stats reset successfully', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error resetting webhook stats:', error);
      res.status(500).json({ success: false, error: 'Failed to reset webhook stats' });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /conversation/:issueKey/report
  // ─────────────────────────────────────────────────────────────────────────
  async getConversationReport(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Issue key is required' });
        return;
      }

      console.log(`📊 Generating conversation report for issue: ${issueKey}`);

      const result = await this.getConversationReportUseCase.execute(issueKey);

      if (!result.hasHistory) {
        res.json({
          success: true,
          data: {
            issueKey: result.issueKey,
            report: 'No conversation history found for this issue.',
            messageCount: 0,
            participants: [],
            summary: 'No conversation to summarize.'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          issueKey: result.issueKey,
          report: result.report,
          messageCount: result.messageCount,
          participants: result.participants,
          conversationHistory: result.conversationHistory,
          generatedAt: result.generatedAt
        }
      });
    } catch (error) {
      console.error('Error generating conversation report:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /assistants
  // ─────────────────────────────────────────────────────────────────────────
  async listAssistants(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 Solicitando lista de asistentes...');
      const assistants = await this.listAssistantsUseCase.execute();
      res.json({ success: true, assistants, count: assistants.length, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error al listar asistentes:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al listar asistentes'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /assistants/set-active
  // ─────────────────────────────────────────────────────────────────────────
  async setActiveAssistant(req: Request, res: Response): Promise<void> {
    try {
      const { assistantId } = req.body;

      if (!assistantId) {
        res.status(400).json({ success: false, error: 'Se requiere el ID del asistente' });
        return;
      }

      console.log(`🔄 Cambiando asistente activo a: ${assistantId}`);
      this.setActiveAssistantUseCase.execute(assistantId);

      res.json({
        success: true,
        message: 'Asistente activo cambiado exitosamente',
        activeAssistant: assistantId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error al cambiar asistente activo:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cambiar asistente'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /assistants/active
  // ─────────────────────────────────────────────────────────────────────────
  async getActiveAssistant(req: Request, res: Response): Promise<void> {
    try {
      const activeAssistant = this.getActiveAssistantUseCase.execute();
      res.json({ success: true, activeAssistant, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error al obtener asistente activo:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener asistente activo'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/services/:serviceId/chat (montado fuera de este router — ver nota de rutas)
  // ─────────────────────────────────────────────────────────────────────────
  async handleServiceChat(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const { message, threadId } = req.body;

      console.log('🟢 handleServiceChat called:', { serviceId, message: message?.substring(0, 50), threadId });

      if (!message) {
        res.status(400).json({ success: false, error: 'Se requiere el mensaje' });
        return;
      }

      console.log(`💬 Chat para servicio ${serviceId}: ${message}`);

      const result = await this.handleServiceChatUseCase.execute(serviceId, message, threadId);

      console.log('🟢 handleServiceChat RESPUESTA COMPLETA:', {
        success: result.success,
        serviceId,
        threadId: result.threadId,
        assistantId: result.assistantId,
        assistantName: result.assistantName,
        error: result.error
      });

      if (result.success) {
        res.json({
          success: true,
          response: result.response,
          threadId: result.threadId,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({ success: false, error: result.error, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      console.error('❌ Error en chat por servicio:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en chat por servicio'
      });
    }
  }
}
