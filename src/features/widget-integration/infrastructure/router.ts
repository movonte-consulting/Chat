import { Router } from 'express';
import { authenticateProtectedToken } from '../../../middleware/auth';
import { WidgetIntegrationController } from './controladores/widget-integration.controller';

/**
 * Montado en /api/widget. Solo connect/send-message llevan authenticateProtectedToken —
 * el resto son públicas, igual que el controller original.
 */
export function buildWidgetIntegrationRouter(controller: WidgetIntegrationController): Router {
  const router = Router();

  router.post('/connect', authenticateProtectedToken, controller.connectToTicket.bind(controller));
  router.post('/send-message', authenticateProtectedToken, controller.sendMessageToJira.bind(controller));

  router.get('/conversation/:issueKey', controller.getConversationHistory.bind(controller));
  router.get('/search-tickets', controller.searchTicketsByEmail.bind(controller));
  router.put('/ticket/:issueKey/status', controller.updateTicketStatus.bind(controller));
  router.get('/ticket/:issueKey', controller.getTicketDetails.bind(controller));
  router.get('/health', controller.healthCheck.bind(controller));
  router.get('/check-messages', controller.checkNewMessages.bind(controller));
  router.get('/assistant-status', controller.checkAssistantStatus.bind(controller));

  return router;
}
