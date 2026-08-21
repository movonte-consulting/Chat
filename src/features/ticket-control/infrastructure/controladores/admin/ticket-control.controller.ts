import { Request, Response } from 'express';
import '../../../../../middleware/auth';
import { RequesterJiraCredentials } from '../../../domain/modelos/disabled-ticket.model';
import { DisableAssistantForTicketUseCase } from '../../../application/admin/disable-assistant-for-ticket.use-case';
import { EnableAssistantForTicketUseCase } from '../../../application/admin/enable-assistant-for-ticket.use-case';
import { GetDisabledTicketsUseCase } from '../../../application/admin/get-disabled-tickets.use-case';
import { CheckTicketAssistantStatusUseCase } from '../../../application/admin/check-ticket-assistant-status.use-case';

export class TicketControlController {
  constructor(
    private readonly disableAssistantForTicketUseCase: DisableAssistantForTicketUseCase,
    private readonly enableAssistantForTicketUseCase: EnableAssistantForTicketUseCase,
    private readonly getDisabledTicketsUseCase: GetDisabledTicketsUseCase,
    private readonly checkTicketAssistantStatusUseCase: CheckTicketAssistantStatusUseCase
  ) {}

  private requesterFrom(req: Request): RequesterJiraCredentials {
    return {
      userId: req.user!.id,
      username: req.user!.username,
      email: req.user!.email,
      jiraToken: req.user!.jiraToken ?? null,
      jiraUrl: (req.user as any).jiraUrl ?? null
    };
  }

  async disableAssistantForTicket(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;
      const { reason } = req.body;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Se requiere el issueKey del ticket' });
        return;
      }

      console.log(`🚫 Desactivando asistente para ticket: ${issueKey}`);

      const result = await this.disableAssistantForTicketUseCase.execute(this.requesterFrom(req), issueKey, reason);

      switch (result.kind) {
        case 'no_credentials':
          res.status(400).json({
            success: false,
            error: 'No tienes credenciales de Jira configuradas. Configúralas en tu perfil.'
          });
          return;
        case 'not_found':
          res.status(404).json({ success: false, error: 'Ticket no encontrado' });
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
      console.error('❌ Error desactivando asistente para ticket:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async enableAssistantForTicket(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Se requiere el issueKey del ticket' });
        return;
      }

      console.log(`✅ Reactivando asistente para ticket: ${issueKey}`);

      const result = await this.enableAssistantForTicketUseCase.execute(this.requesterFrom(req), issueKey);

      switch (result.kind) {
        case 'no_credentials':
          res.status(400).json({
            success: false,
            error: 'No tienes credenciales de Jira configuradas. Configúralas en tu perfil.'
          });
          return;
        case 'not_found':
          res.status(404).json({ success: false, error: 'Ticket no encontrado' });
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
      console.error('❌ Error reactivando asistente para ticket:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getDisabledTickets(req: Request, res: Response): Promise<void> {
    try {
      const disabledTickets = this.getDisabledTicketsUseCase.execute();
      res.json({
        success: true,
        data: { disabledTickets, count: disabledTickets.length },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error obteniendo tickets desactivados:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async checkTicketAssistantStatus(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey } = req.params;

      if (!issueKey) {
        res.status(400).json({ success: false, error: 'Se requiere el issueKey del ticket' });
        return;
      }

      const status = this.checkTicketAssistantStatusUseCase.execute(issueKey);

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error verificando estado del ticket:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
