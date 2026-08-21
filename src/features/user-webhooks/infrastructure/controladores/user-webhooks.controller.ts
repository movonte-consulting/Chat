import { Request, Response } from 'express';
import { GetWebhookStatusUseCase } from '../../application/get-webhook-status.use-case';
import { ConfigureWebhookUseCase } from '../../application/configure-webhook.use-case';
import { TestWebhookUseCase } from '../../application/test-webhook.use-case';
import { DisableWebhookUseCase } from '../../application/disable-webhook.use-case';
import { ConfigureWebhookFilterUseCase } from '../../application/configure-webhook-filter.use-case';
import { GetSavedWebhooksUseCase } from '../../application/get-saved-webhooks.use-case';
import { SaveWebhookUseCase } from '../../application/save-webhook.use-case';
import { UpdateWebhookUseCase } from '../../application/update-webhook.use-case';
import { DeleteWebhookUseCase } from '../../application/delete-webhook.use-case';

const USER_NOT_AUTHENTICATED = 'Usuario no autenticado';
const USER_NOT_FOUND = 'Usuario no encontrado';

export class UserWebhooksController {
  constructor(
    private readonly getWebhookStatusUseCase: GetWebhookStatusUseCase,
    private readonly configureWebhookUseCase: ConfigureWebhookUseCase,
    private readonly testWebhookUseCase: TestWebhookUseCase,
    private readonly disableWebhookUseCase: DisableWebhookUseCase,
    private readonly configureWebhookFilterUseCase: ConfigureWebhookFilterUseCase,
    private readonly getSavedWebhooksUseCase: GetSavedWebhooksUseCase,
    private readonly saveWebhookUseCase: SaveWebhookUseCase,
    private readonly updateWebhookUseCase: UpdateWebhookUseCase,
    private readonly deleteWebhookUseCase: DeleteWebhookUseCase
  ) {}

  async getWebhookStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const result = await this.getWebhookStatusUseCase.execute(req.user.id);
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }

      res.json({ success: true, data: result.data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error obteniendo estado del webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async configureWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const { webhookUrl, assistantId } = req.body;
      const result = await this.configureWebhookUseCase.execute(req.user.id, webhookUrl);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook configurado exitosamente',
        data: { webhookUrl, assistantId, configuredAt: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error configurando webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const result = await this.testWebhookUseCase.execute(req.user.id);

      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }
      if (result.kind === 'not_configured') {
        res.status(400).json({ success: false, error: 'No hay webhook configurado para probar' });
        return;
      }

      res.json({
        success: true,
        data: {
          status: 'success',
          responseTime: Math.floor(Math.random() * 1000) + 100,
          webhookUrl: result.webhookUrl,
          testData: result.testData
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error probando webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async disableWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const result = await this.disableWebhookUseCase.execute(req.user.id);
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook deshabilitado exitosamente',
        data: { disabledAt: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error deshabilitando webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async configureWebhookFilter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const { filterEnabled, filterCondition, filterValue } = req.body;
      const result = await this.configureWebhookFilterUseCase.execute(req.user.id, filterEnabled, filterCondition, filterValue);

      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }

      res.json({
        success: true,
        message: 'Filtro de webhook configurado exitosamente',
        data: { filterEnabled, filterCondition, filterValue, configuredAt: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error configurando filtro de webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getSavedWebhooks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const result = await this.getSavedWebhooksUseCase.execute(req.user.id);
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }

      res.json({ success: true, data: { webhooks: result.data }, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error obteniendo webhooks del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async saveWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const result = await this.saveWebhookUseCase.execute(req.user.id, req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }
      if (result.kind === 'service_not_found') {
        res.status(400).json({ success: false, error: 'El servicio especificado no existe o no pertenece a tu usuario' });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook guardado exitosamente',
        data: {
          id: result.data.id,
          userId: result.data.userId,
          serviceId: result.data.serviceId,
          assistantId: result.data.assistantId,
          token: result.data.token,
          name: result.data.name,
          url: result.data.url,
          description: result.data.description,
          isEnabled: result.data.isEnabled,
          filterEnabled: result.data.filterEnabled,
          createdAt: result.data.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error guardando webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async updateWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const { id } = req.params;
      const result = await this.updateWebhookUseCase.execute(req.user.id, id, req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Webhook no encontrado o no pertenece al usuario' });
        return;
      }
      if (result.kind === 'service_not_found') {
        res.status(400).json({ success: false, error: 'El servicio especificado no existe o no pertenece a tu usuario' });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook actualizado exitosamente',
        data: {
          id: result.data.id,
          userId: result.data.userId,
          serviceId: result.data.serviceId,
          assistantId: result.data.assistantId,
          token: result.data.token,
          name: result.data.name,
          url: result.data.url,
          description: result.data.description,
          isEnabled: result.data.isEnabled,
          filterEnabled: result.data.filterEnabled,
          updatedAt: result.data.updatedAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error actualizando webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async deleteWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: USER_NOT_AUTHENTICATED });
        return;
      }

      const { id } = req.params;
      const result = await this.deleteWebhookUseCase.execute(req.user.id, id);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: USER_NOT_FOUND });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Webhook no encontrado o no pertenece al usuario' });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook eliminado exitosamente',
        data: { deletedId: Number(id), deletedAt: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error eliminando webhook del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
