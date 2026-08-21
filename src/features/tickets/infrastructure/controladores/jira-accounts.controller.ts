import { Request, Response } from 'express';
import '../../../../middleware/auth'; // Para tipos de Request.user
import { GetServiceJiraAccountsUseCase } from '../../application/get-service-jira-accounts.use-case';
import { UpsertServiceJiraAccountsUseCase } from '../../application/upsert-service-jira-accounts.use-case';
import { DeleteServiceJiraAccountsUseCase } from '../../application/delete-service-jira-accounts.use-case';

export class JiraAccountsController {
  constructor(
    private readonly getServiceJiraAccounts: GetServiceJiraAccountsUseCase,
    private readonly upsertServiceJiraAccounts: UpsertServiceJiraAccountsUseCase,
    private readonly deleteServiceJiraAccounts: DeleteServiceJiraAccountsUseCase
  ) {}

  /** GET /api/service/:serviceId/jira-accounts */
  getServiceJiraAccountsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      console.log('🔍 Obteniendo cuentas de Jira:', { userId, serviceId });

      const data = await this.getServiceJiraAccounts.execute(userId, serviceId);

      if (!data) {
        res.json({ success: true, data: null, message: 'No hay cuentas configuradas para este servicio' });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('❌ Error al obtener cuentas de Jira:', error);
      res.status(500).json({ success: false, error: 'Error al obtener cuentas de Jira' });
    }
  };

  /** POST/PUT /api/service/:serviceId/jira-accounts */
  upsertServiceJiraAccountsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const userId = req.user?.id;
      const {
        assistantJiraEmail,
        assistantJiraToken,
        assistantJiraUrl,
        widgetJiraEmail,
        widgetJiraToken,
        widgetJiraUrl,
        isActive
      } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      console.log('💾 Guardando cuentas de Jira:', {
        userId,
        serviceId,
        hasAssistantAccount: !!assistantJiraEmail,
        hasWidgetAccount: !!widgetJiraEmail
      });

      const result = await this.upsertServiceJiraAccounts.execute(userId, serviceId, {
        assistantJiraEmail,
        assistantJiraToken,
        assistantJiraUrl,
        widgetJiraEmail,
        widgetJiraToken,
        widgetJiraUrl,
        isActive
      });

      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error });
        return;
      }

      res.json({ success: true, data: result.data, message: 'Cuentas de Jira guardadas exitosamente' });
    } catch (error) {
      console.error('❌ Error al guardar cuentas de Jira:', error);
      res.status(500).json({ success: false, error: 'Error al guardar cuentas de Jira' });
    }
  };

  /** DELETE /api/service/:serviceId/jira-accounts */
  deleteServiceJiraAccountsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      console.log('🗑️ Eliminando cuentas de Jira:', { userId, serviceId });

      await this.deleteServiceJiraAccounts.execute(userId, serviceId);

      console.log('✅ Cuentas de Jira eliminadas');

      res.json({ success: true, message: 'Cuentas de Jira eliminadas exitosamente' });
    } catch (error) {
      console.error('❌ Error al eliminar cuentas de Jira:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar cuentas de Jira' });
    }
  };
}
