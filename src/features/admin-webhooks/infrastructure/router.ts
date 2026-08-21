import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../../middleware/auth';
import { AdminWebhooksController } from './controladores/admin-webhooks.controller';

/**
 * Este feature se monta en 3 prefijos distintos del legacy (/api/admin/webhooks/all,
 * /api/admin/webhooks/create, /api/admin/webhooks/saved, /api/admin/webhooks/save,
 * /api/admin/webhooks/:id) — se exponen los handlers vía router pero el mapeo de rutas
 * completo se resuelve en dependency-injection.ts porque hay alias duplicados (create==save).
 */
export function buildAdminWebhooksRouter(controller: AdminWebhooksController): Router {
  const router = Router();
  router.get('/all', authenticateToken, requirePermission('webhookConfiguration'), controller.getAllWebhooks.bind(controller));
  router.get('/saved', authenticateToken, requirePermission('webhookConfiguration'), controller.getAllWebhooks.bind(controller));
  router.post('/create', authenticateToken, requirePermission('webhookConfiguration'), controller.createWebhook.bind(controller));
  router.post('/save', authenticateToken, requirePermission('webhookConfiguration'), controller.createWebhook.bind(controller));
  router.put('/:id', authenticateToken, requirePermission('webhookConfiguration'), controller.updateWebhook.bind(controller));
  router.delete('/:id', authenticateToken, requirePermission('webhookConfiguration'), controller.deleteWebhook.bind(controller));
  return router;
}
