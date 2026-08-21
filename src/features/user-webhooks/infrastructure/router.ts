import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { UserWebhooksController } from './controladores/user-webhooks.controller';

/** Montado en /api/user/webhook (singular) — el "webhook simple" vía UserWebhookConfigRegistry. */
export function buildUserWebhookRouter(controller: UserWebhooksController): Router {
  const router = Router();
  router.get('/status', authenticateToken, controller.getWebhookStatus.bind(controller));
  router.post('/configure', authenticateToken, controller.configureWebhook.bind(controller));
  router.post('/test', authenticateToken, controller.testWebhook.bind(controller));
  router.post('/disable', authenticateToken, controller.disableWebhook.bind(controller));
  router.post('/filter', authenticateToken, controller.configureWebhookFilter.bind(controller));
  return router;
}

/** Montado en /api/user/webhooks (plural) — el CRUD completo vía user_webhooks. */
export function buildUserWebhooksCrudRouter(controller: UserWebhooksController): Router {
  const router = Router();
  router.get('/saved', authenticateToken, controller.getSavedWebhooks.bind(controller));
  router.post('/save', authenticateToken, controller.saveWebhook.bind(controller));
  router.put('/:id', authenticateToken, controller.updateWebhook.bind(controller));
  router.delete('/:id', authenticateToken, controller.deleteWebhook.bind(controller));
  return router;
}
