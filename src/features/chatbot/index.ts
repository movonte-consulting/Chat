/**
 * Public surface of the chatbot feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export {
  chatbotRouter,
  handleServiceChat,
  handleJiraWebhook,
  setWebSocketServer
} from './infrastructure/dependency-injection';
