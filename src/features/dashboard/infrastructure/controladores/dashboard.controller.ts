import { Request, Response } from 'express';
import { GetDashboardUseCase } from '../../application/get-dashboard.use-case';
import { RequesterJiraCredentials } from '../../domain/modelos/requester-jira-credentials.model';

const NO_CREDENTIALS_ERROR = 'No tienes credenciales de Jira configuradas. Configúralas en tu perfil.';

function requesterFrom(req: Request): RequesterJiraCredentials | null {
  if (!req.user) return null;
  return {
    userId: req.user.id,
    username: (req.user as any).username || '',
    email: req.user.email,
    jiraToken: req.user.jiraToken || null,
    jiraUrl: req.user.jiraUrl || null
  };
}

export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const credentials = requesterFrom(req);
      const userId = req.user?.id || 1;
      const result = await this.getDashboardUseCase.execute(credentials, userId);

      if (result.kind === 'no_credentials') {
        res.status(400).json({ success: false, error: NO_CREDENTIALS_ERROR });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error obteniendo dashboard:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
