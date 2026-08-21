import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../../middleware/auth';
import { WebhookAdminController } from './controladores/webhook-admin.controller';

/** Montado en /api/admin — declara los sub-paths completos de cada método (webhook/*, status-disable/*, statuses/*). */
export function buildWebhookAdminRouter(controller: WebhookAdminController): Router {
  const router = Router();

  router.post('/webhook/configure', authenticateToken, requirePermission('webhookConfiguration'), controller.configureWebhook.bind(controller));
  router.post('/webhook/test', authenticateToken, requirePermission('webhookConfiguration'), controller.testWebhook.bind(controller));
  router.post('/webhook/disable', authenticateToken, requirePermission('webhookConfiguration'), controller.disableWebhook.bind(controller));
  router.get('/webhook/status', authenticateToken, requirePermission('webhookConfiguration'), controller.getWebhookStatus.bind(controller));
  router.post('/webhook/filter', authenticateToken, requirePermission('webhookConfiguration'), controller.configureWebhookFilter.bind(controller));
  router.post('/webhook/test-filter', authenticateToken, requirePermission('webhookConfiguration'), controller.testWebhookFilter.bind(controller));

  router.post('/status-disable/configure', authenticateToken, requirePermission('automaticAIDisableRules'), controller.configureStatusBasedDisable.bind(controller));
  router.get('/status-disable/config', authenticateToken, requirePermission('automaticAIDisableRules'), controller.getStatusBasedDisableConfig.bind(controller));
  router.get('/statuses/available', authenticateToken, requirePermission('automaticAIDisableRules'), controller.getAvailableStatuses.bind(controller));

  return router;
}
