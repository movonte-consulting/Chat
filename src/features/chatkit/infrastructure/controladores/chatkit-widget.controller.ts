import { Request, Response } from 'express';
import { ConnectToTicketUseCase } from '../../application/connect-to-ticket.use-case';
import { SendWidgetMessageUseCase } from '../../application/send-widget-message.use-case';
import { GetSessionStatusUseCase } from '../../application/get-session-status.use-case';

export class ChatKitWidgetController {
  constructor(
    private readonly connectToTicketUseCase: ConnectToTicketUseCase,
    private readonly sendWidgetMessageUseCase: SendWidgetMessageUseCase,
    private readonly getSessionStatusUseCase: GetSessionStatusUseCase
  ) {}

  async connectToTicket(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.body;
      const result = await this.connectToTicketUseCase.execute(issueKey);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: `Widget conectado al ticket ${issueKey}`, sessionId: result.sessionId, issueKey });
    } catch (error) {
      console.error('Error conectando widget al ticket:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, message, customerInfo } = req.body;
      const result = await this.sendWidgetMessageUseCase.execute(issueKey, message, customerInfo);

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
      console.error('Error enviando mensaje del widget:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async getSessionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;
      const result = this.getSessionStatusUseCase.execute(issueKey);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, hasActiveSession: result.hasActiveSession, issueKey });
    } catch (error) {
      console.error('Error obteniendo estado de sesión:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
