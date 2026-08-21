import { Request, Response } from 'express';
import { GetAllWebhooksUseCase } from '../../application/get-all-webhooks.use-case';
import { CreateWebhookUseCase } from '../../application/create-webhook.use-case';
import { UpdateWebhookUseCase } from '../../application/update-webhook.use-case';
import { DeleteWebhookUseCase } from '../../application/delete-webhook.use-case';

/** El chequeo de rol admin aquí es una defensa redundante con requirePermission del router — se preserva tal cual. */
function isAdmin(req: Request): boolean {
  return !!req.user && req.user.role === 'admin';
}

export class AdminWebhooksController {
  constructor(
    private readonly getAllWebhooksUseCase: GetAllWebhooksUseCase,
    private readonly createWebhookUseCase: CreateWebhookUseCase,
    private readonly updateWebhookUseCase: UpdateWebhookUseCase,
    private readonly deleteWebhookUseCase: DeleteWebhookUseCase
  ) {}

  async getAllWebhooks(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' });
        return;
      }

      const webhooks = await this.getAllWebhooksUseCase.execute();

      res.json({ success: true, data: { webhooks }, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error obteniendo webhooks de admin:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async createWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' });
        return;
      }

      const result = await this.createWebhookUseCase.execute(req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      if (result.kind === 'service_not_found') {
        res.status(400).json({ success: false, error: 'El servicio especificado no existe o no pertenece al usuario' });
        return;
      }

      res.json({ success: true, message: 'Webhook creado exitosamente', data: result.data });
    } catch (error) {
      console.error('❌ Error creando webhook de admin:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async updateWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' });
        return;
      }

      const { id } = req.params;
      const result = await this.updateWebhookUseCase.execute(id, req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Webhook no encontrado' });
        return;
      }
      if (result.kind === 'service_not_found') {
        res.status(400).json({ success: false, error: 'El servicio especificado no existe o no pertenece al usuario' });
        return;
      }

      res.json({ success: true, message: 'Webhook actualizado exitosamente', data: result.data });
    } catch (error) {
      console.error('❌ Error actualizando webhook de admin:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async deleteWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' });
        return;
      }

      const { id } = req.params;
      const result = await this.deleteWebhookUseCase.execute(id);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Webhook no encontrado' });
        return;
      }

      res.json({ success: true, message: 'Webhook eliminado exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando webhook de admin:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
