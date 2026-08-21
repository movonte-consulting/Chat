/**
 * Composition root del feature chatbot: instancia adapters/repositorios → casos de uso →
 * controller → router, y expone la superficie pública que otras partes del sistema pueden usar
 * (chatbotRouter, handleServiceChat, handleJiraWebhook, setWebSocketServer).
 */

import { Router, Request, Response } from 'express';
import { OpenAIService } from '../../../services/openAI_service';

import { InMemoryWebhookStateRepository } from './repositorios/in-memory-webhook-state.repository';
import { UserServiceConfigRepository } from './repositorios/user-service-config.repository';
import { WebSocketNotifierAdapter } from './adaptadores/websocket-notifier.adapter';
import { UserTicketToggleAdapter } from './adaptadores/user-ticket-toggle.adapter';
import { ChatbotUserLookupAdapter } from './adaptadores/chatbot-user-lookup.adapter';
import { AssistantChatAdapter } from './adaptadores/assistant-chat.adapter';
import { JiraAiCommentAdapter } from './adaptadores/jira-ai-comment.adapter';
import { WhatsAppNotifierAdapter } from './adaptadores/whatsapp-notifier.adapter';
import { UserWebhookLookupAdapter } from './adaptadores/user-webhook-lookup.adapter';
import { UserWebhookDispatcherAdapter } from './adaptadores/user-webhook-dispatcher.adapter';
import { EscalationAssistantAdapter } from './adaptadores/escalation-assistant.adapter';
import { ChatbotServiceConfigAdapter } from './adaptadores/chatbot-service-config.adapter';
import { StatusChangeAdapter } from './adaptadores/status-change.adapter';
import { LegacyOpenAIChatAdapter } from './adaptadores/legacy-openai-chat.adapter';
import { WebhookStatsPersistenceAdapter } from './adaptadores/webhook-stats-persistence.adapter';

import { RecordWebhookReceivedUseCase } from '../application/record-webhook-received.use-case';
import { RecordWebhookErrorUseCase } from '../application/record-webhook-error.use-case';
import { RunParallelWebhookFlowUseCase } from '../application/run-parallel-webhook-flow.use-case';
import { ProcessCommentCreatedUseCase } from '../application/process-comment-created.use-case';
import { HandleStatusChangeUseCase } from '../application/handle-status-change.use-case';
import { HandleIssueCreatedUseCase } from '../application/handle-issue-created.use-case';
import { HandleDirectChatUseCase } from '../application/handle-direct-chat.use-case';
import { HandleChatWithInstructionsUseCase } from '../application/handle-chat-with-instructions.use-case';
import { HandleJiraChatUseCase } from '../application/handle-jira-chat.use-case';
import { GetThreadHistoryUseCase } from '../application/get-thread-history.use-case';
import { ListActiveThreadsUseCase } from '../application/list-active-threads.use-case';
import { ListAssistantsUseCase } from '../application/list-assistants.use-case';
import { SetActiveAssistantUseCase } from '../application/set-active-assistant.use-case';
import { GetActiveAssistantUseCase } from '../application/get-active-assistant.use-case';
import { HandleServiceChatUseCase } from '../application/handle-service-chat.use-case';
import { GetConversationReportUseCase } from '../application/get-conversation-report.use-case';
import { GetWebhookStatsUseCase } from '../application/get-webhook-stats.use-case';
import { ResetWebhookStatsUseCase } from '../application/reset-webhook-stats.use-case';

import { ChatbotController } from './controladores/chatbot.controller';
import { buildChatbotRouter } from './router';

// ── Infrastructure (adapters/repositorios) ──────────────────────────────────
const webhookState = new InMemoryWebhookStateRepository();
const userServiceConfigRepository = new UserServiceConfigRepository();
const webSocketNotifier = new WebSocketNotifierAdapter();
const userTicketToggle = new UserTicketToggleAdapter();
const chatbotUserLookup = new ChatbotUserLookupAdapter();
const assistantChat = new AssistantChatAdapter();
const jiraAiComment = new JiraAiCommentAdapter();
const whatsappNotifier = new WhatsAppNotifierAdapter();
const userWebhookLookup = new UserWebhookLookupAdapter();
const userWebhookDispatcher = new UserWebhookDispatcherAdapter();
const escalationAssistant = new EscalationAssistantAdapter();
const chatbotServiceConfig = new ChatbotServiceConfigAdapter();
const statusChange = new StatusChangeAdapter();
const webhookStatsPersistence = new WebhookStatsPersistenceAdapter();

// OpenAIService mantiene estado (asistente activo, threads en memoria) — una sola instancia
// compartida, igual que `new OpenAIService()` pasado una vez al ChatbotController original.
const openaiService = new OpenAIService();
const legacyOpenAIChat = new LegacyOpenAIChatAdapter(openaiService);

// ── Application (use cases) ─────────────────────────────────────────────────
const recordWebhookReceived = new RecordWebhookReceivedUseCase(webhookState);
const recordWebhookError = new RecordWebhookErrorUseCase(webhookState);

const runParallelWebhookFlow = new RunParallelWebhookFlowUseCase(
  userWebhookLookup, chatbotServiceConfig, escalationAssistant, userWebhookDispatcher
);

const processCommentCreated = new ProcessCommentCreatedUseCase(
  userServiceConfigRepository, webhookState, webSocketNotifier, webhookState,
  userTicketToggle, webhookState, chatbotUserLookup, assistantChat, webhookState,
  webhookStatsPersistence, jiraAiComment, whatsappNotifier, runParallelWebhookFlow
);

const handleStatusChangeUseCase = new HandleStatusChangeUseCase(userServiceConfigRepository, statusChange);
const handleIssueCreatedUseCase = new HandleIssueCreatedUseCase(userServiceConfigRepository);

const handleDirectChatUseCase = new HandleDirectChatUseCase(legacyOpenAIChat);
const handleChatWithInstructionsUseCase = new HandleChatWithInstructionsUseCase(legacyOpenAIChat);
const handleJiraChatUseCase = new HandleJiraChatUseCase(legacyOpenAIChat);
const getThreadHistoryUseCase = new GetThreadHistoryUseCase(legacyOpenAIChat);
const listActiveThreadsUseCase = new ListActiveThreadsUseCase(legacyOpenAIChat);
const listAssistantsUseCase = new ListAssistantsUseCase(legacyOpenAIChat);
const setActiveAssistantUseCase = new SetActiveAssistantUseCase(legacyOpenAIChat);
const getActiveAssistantUseCase = new GetActiveAssistantUseCase(legacyOpenAIChat);
const handleServiceChatUseCase = new HandleServiceChatUseCase(legacyOpenAIChat);
const getConversationReportUseCase = new GetConversationReportUseCase(webhookState, legacyOpenAIChat);
const getWebhookStatsUseCase = new GetWebhookStatsUseCase(webhookState);
const resetWebhookStatsUseCase = new ResetWebhookStatsUseCase(webhookState);

// ── Presentation (controller + router) ──────────────────────────────────────
const chatbotController = new ChatbotController(
  recordWebhookReceived, recordWebhookError, processCommentCreated,
  handleStatusChangeUseCase, handleIssueCreatedUseCase,
  handleDirectChatUseCase, handleChatWithInstructionsUseCase, handleJiraChatUseCase,
  getThreadHistoryUseCase, listActiveThreadsUseCase, listAssistantsUseCase,
  setActiveAssistantUseCase, getActiveAssistantUseCase, handleServiceChatUseCase,
  getConversationReportUseCase, getWebhookStatsUseCase, resetWebhookStatsUseCase
);

export const chatbotRouter: Router = buildChatbotRouter(chatbotController);

// ── Superficie pública adicional (rutas que no cuelgan de /api/chatbot) ─────
export function handleServiceChat(req: Request, res: Response): Promise<void> {
  return chatbotController.handleServiceChat(req, res);
}

export function handleJiraWebhook(req: Request, res: Response): Promise<void> {
  return chatbotController.handleJiraWebhook(req, res);
}

export function setWebSocketServer(io: any): void {
  webSocketNotifier.setServer(io);
}
