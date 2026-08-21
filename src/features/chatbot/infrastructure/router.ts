import { Router } from 'express';
import { ChatbotController } from './controladores/chatbot.controller';

/**
 * Rutas bajo /api/chatbot/*. `handleServiceChat` (POST /api/services/:serviceId/chat) queda
 * fuera de este router porque comparte el prefijo /api/services con adminController — se
 * registra directo en routes/index.ts usando el handler exportado por el barrel del feature.
 */
export function buildChatbotRouter(controller: ChatbotController): Router {
  const router = Router();

  router.post('/webhook/jira', controller.handleJiraWebhook.bind(controller));
  router.post('/chat', controller.handleDirectChat.bind(controller));

  router.get('/assistants', controller.listAssistants.bind(controller));
  router.post('/assistants/set-active', controller.setActiveAssistant.bind(controller));
  router.get('/assistants/active', controller.getActiveAssistant.bind(controller));

  router.post('/chat-with-instructions', controller.handleChatWithInstructions.bind(controller));
  router.post('/jira-chat', controller.handleJiraChat.bind(controller));

  router.get('/thread/:threadId', controller.getThreadHistory.bind(controller));
  router.get('/threads', controller.listActiveThreads.bind(controller));

  router.get('/webhook/stats', controller.getWebhookStats.bind(controller));
  router.post('/webhook/reset', controller.resetWebhookStats.bind(controller));

  router.get('/conversation/:issueKey/report', controller.getConversationReport.bind(controller));

  return router;
}
