import { Request, Response } from 'express';
import { CreateSessionUseCase } from '../../application/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/refresh-session.use-case';
import { GetSessionInfoUseCase } from '../../application/get-session-info.use-case';
import { DeleteSessionUseCase } from '../../application/delete-session.use-case';
import { GetUsageStatsUseCase } from '../../application/get-usage-stats.use-case';

export class ChatKitSessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly getSessionInfoUseCase: GetSessionInfoUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
    private readonly getUsageStatsUseCase: GetUsageStatsUseCase
  ) {}

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username } = req.body;
      const result = await this.createSessionUseCase.execute(userId, username);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        data: {
          client_secret: result.data.clientSecret,
          session_id: result.data.sessionId,
          expires_at: result.data.expiresAt
        }
      });
    } catch (error) {
      console.error('❌ Error creando sesión de ChatKit:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor al crear sesión de ChatKit' });
    }
  }

  async refreshSession(req: Request, res: Response): Promise<void> {
    try {
      const { existingSecret, userId } = req.body;
      const result = await this.refreshSessionUseCase.execute(existingSecret, userId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        data: {
          client_secret: result.data.clientSecret,
          session_id: result.data.sessionId,
          expires_at: result.data.expiresAt
        }
      });
    } catch (error) {
      console.error('❌ Error refrescando sesión de ChatKit:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor al refrescar sesión de ChatKit' });
    }
  }

  async getSessionInfo(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const result = this.getSessionInfoUseCase.execute(sessionId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('❌ Error obteniendo información de sesión:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor al obtener información de sesión' });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const result = this.deleteSessionUseCase.execute(sessionId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: 'Sesión marcada para eliminación' });
    } catch (error) {
      console.error('❌ Error eliminando sesión:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor al eliminar sesión' });
    }
  }

  async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const stats = this.getUsageStatsUseCase.execute(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor al obtener estadísticas' });
    }
  }
}
