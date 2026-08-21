import { Request, Response } from 'express';
import '../../../../../middleware/auth';
import { DisableAssistantForTicketUseCase } from '../../../application/user/disable-assistant-for-ticket.use-case';
import { EnableAssistantForTicketUseCase } from '../../../application/user/enable-assistant-for-ticket.use-case';
import { GetDisabledTicketsUseCase } from '../../../application/user/get-disabled-tickets.use-case';
import { CheckTicketAssistantStatusUseCase } from '../../../application/user/check-ticket-assistant-status.use-case';

export class UserTicketControlController {
  constructor(
    private readonly disableAssistantForTicketUseCase: DisableAssistantForTicketUseCase,
    private readonly enableAssistantForTicketUseCase: EnableAssistantForTicketUseCase,
    private readonly getDisabledTicketsUseCase: GetDisabledTicketsUseCase,
    private readonly checkTicketAssistantStatusUseCase: CheckTicketAssistantStatusUseCase
  ) {}

  async getDisabledTickets(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getDisabledTicketsUseCase.execute(req.user.id);

      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        success: true,
        data: { disabledTickets: result.disabledTickets, count: result.disabledTickets.length },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error obteniendo tickets deshabilitados del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async disableAssistantForTicket(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { issueKey } = req.params;
      const { reason } = req.body;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Se requiere el issueKey del ticket' });
        return;
      }

      const result = await this.disableAssistantForTicketUseCase.execute(req.user.id, issueKey, reason);

      switch (result.kind) {
        case 'user_not_found':
          res.status(404).json({ success: false, error: 'Usuario no encontrado' });
          return;
        case 'no_credentials':
          res.status(400).json({ success: false, error: 'Usuario no tiene configurados los tokens de Jira' });
          return;
        case 'not_found':
          res.status(404).json({ success: false, error: `Ticket ${result.issueKey} no encontrado en tu instancia de Jira` });
          return;
        case 'disabled':
          res.json({
            success: true,
            message: `AI Assistant disabled for ticket ${result.issueKey}`,
            data: {
              issueKey: result.issueKey,
              issueSummary: result.issueSummary,
              reason: result.reason,
              disabledAt: result.disabledAt
            },
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error deshabilitando asistente para ticket del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async enableAssistantForTicket(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { issueKey } = req.params;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Se requiere el issueKey del ticket' });
        return;
      }

      const result = await this.enableAssistantForTicketUseCase.execute(req.user.id, issueKey);

      switch (result.kind) {
        case 'user_not_found':
          res.status(404).json({ success: false, error: 'Usuario no encontrado' });
          return;
        case 'no_credentials':
          res.status(400).json({ success: false, error: 'Usuario no tiene configurados los tokens de Jira' });
          return;
        case 'not_found':
          res.status(404).json({ success: false, error: `Ticket ${result.issueKey} no encontrado en tu instancia de Jira` });
          return;
        case 'enabled':
          res.json({
            success: true,
            message: `AI Assistant re-enabled for ticket ${result.issueKey}`,
            data: {
              issueKey: result.issueKey,
              issueSummary: result.issueSummary,
              enabledAt: result.enabledAt
            },
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error habilitando asistente para ticket del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async checkTicketAssistantStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { issueKey } = req.params;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Se requiere el issueKey del ticket' });
        return;
      }

      const result = await this.checkTicketAssistantStatusUseCase.execute(req.user.id, issueKey);

      switch (result.kind) {
        case 'user_not_found':
          res.status(404).json({ success: false, error: 'Usuario no encontrado' });
          return;
        case 'no_credentials':
          res.status(400).json({ success: false, error: 'Usuario no tiene configurados los tokens de Jira' });
          return;
        case 'not_found':
          res.status(404).json({ success: false, error: `Ticket ${result.issueKey} no encontrado en tu instancia de Jira` });
          return;
        case 'status':
          res.json({
            success: true,
            data: { issueKey: result.issueKey, isDisabled: result.isDisabled, ticketInfo: result.ticketInfo },
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error verificando estado del ticket del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
