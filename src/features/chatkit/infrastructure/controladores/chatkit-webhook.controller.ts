import { Request, Response } from 'express';
import { HandleJiraWebhookUseCase } from '../../application/handle-jira-webhook.use-case';
import { ProcessDirectChatUseCase } from '../../application/process-direct-chat.use-case';

export class ChatKitWebhookController {
  constructor(
    private readonly handleJiraWebhookUseCase: HandleJiraWebhookUseCase,
    private readonly processDirectChatUseCase: ProcessDirectChatUseCase
  ) {}

  async handleJiraWebhook(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.handleJiraWebhookUseCase.execute(req.body);

      if (result.kind === 'ignored') {
        res.json({ success: true, message: result.message });
        return;
      }
      if (result.kind === 'failed') {
        res.status(500).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: 'Comentario procesado exitosamente', sessionId: result.sessionId });
    } catch (error) {
      console.error('Error procesando webhook de Jira:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async processDirectChat(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, message, userInfo } = req.body;
      const result = await this.processDirectChatUseCase.execute(issueKey, message, userInfo);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'failed') {
        res.status(500).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: 'Mensaje procesado exitosamente', sessionId: result.sessionId, issueKey });
    } catch (error) {
      console.error('Error procesando chat directo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
