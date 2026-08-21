import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { ChatKitSessionController } from './controladores/chatkit-session.controller';
import { ChatKitWidgetController } from './controladores/chatkit-widget.controller';
import { ChatKitWebhookController } from './controladores/chatkit-webhook.controller';

/**
 * Montado en /api/chatkit. IMPORTANTE: define GET/DELETE /session/:sessionId, que coincide
 * en forma con GET /api/chatkit/session/:issueKey del widget router — debe montarse ANTES
 * que chatkitWidgetRouter en routes/index.ts para preservar el shadowing legacy (el handler
 * de sesión "gana" siempre sobre el de estado del widget).
 */
export function buildChatkitSessionRouter(controller: ChatKitSessionController): Router {
  const router = Router();
  router.post('/session', authenticateToken, controller.createSession.bind(controller));
  router.post('/refresh', authenticateToken, controller.refreshSession.bind(controller));
  router.get('/session/:sessionId', authenticateToken, controller.getSessionInfo.bind(controller));
  router.delete('/session/:sessionId', authenticateToken, controller.deleteSession.bind(controller));
  router.get('/stats', authenticateToken, controller.getUsageStats.bind(controller));
  return router;
}

/** Montado en /api/chatkit/widget. */
export function buildChatkitWidgetRouter(controller: ChatKitWidgetController): Router {
  const router = Router();
  router.post('/connect', authenticateToken, controller.connectToTicket.bind(controller));
  router.post('/send', authenticateToken, controller.sendMessage.bind(controller));
  return router;
}

/**
 * Montado en /api/chatkit. Incluye el GET /session/:issueKey del widget (inalcanzable por el
 * shadowing de chatkitSessionRouter, ver arriba — se preserva igual) y las rutas de webhook/chat directo.
 */
export function buildChatkitWebhookRouter(
  webhookController: ChatKitWebhookController,
  widgetController: ChatKitWidgetController
): Router {
  const router = Router();
  router.get('/session/:issueKey', authenticateToken, widgetController.getSessionStatus.bind(widgetController));
  router.post('/webhook/jira', webhookController.handleJiraWebhook.bind(webhookController));
  router.post('/chat/direct', authenticateToken, webhookController.processDirectChat.bind(webhookController));
  return router;
}
