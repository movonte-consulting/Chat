import { Router } from 'express';

import { OpenAiChatKitApiAdapter } from './adaptadores/openai-chatkit-api.adapter';
import { ChatKitJiraServiceAdapter } from './adaptadores/chatkit-jira-service.adapter';

import { CreateSessionUseCase } from '../application/create-session.use-case';
import { RefreshSessionUseCase } from '../application/refresh-session.use-case';
import { GetSessionInfoUseCase } from '../application/get-session-info.use-case';
import { DeleteSessionUseCase } from '../application/delete-session.use-case';
import { GetUsageStatsUseCase } from '../application/get-usage-stats.use-case';
import { ConnectToTicketUseCase } from '../application/connect-to-ticket.use-case';
import { SendWidgetMessageUseCase } from '../application/send-widget-message.use-case';
import { GetSessionStatusUseCase } from '../application/get-session-status.use-case';
import { HandleJiraWebhookUseCase } from '../application/handle-jira-webhook.use-case';
import { ProcessDirectChatUseCase } from '../application/process-direct-chat.use-case';

import { ChatKitSessionController } from './controladores/chatkit-session.controller';
import { ChatKitWidgetController } from './controladores/chatkit-widget.controller';
import { ChatKitWebhookController } from './controladores/chatkit-webhook.controller';
import { buildChatkitSessionRouter, buildChatkitWidgetRouter, buildChatkitWebhookRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const chatKitOpenAiSession = new OpenAiChatKitApiAdapter();
const chatKitJira = new ChatKitJiraServiceAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const createSessionUseCase = new CreateSessionUseCase(chatKitOpenAiSession);
const refreshSessionUseCase = new RefreshSessionUseCase(chatKitOpenAiSession);
const getSessionInfoUseCase = new GetSessionInfoUseCase();
const deleteSessionUseCase = new DeleteSessionUseCase();
const getUsageStatsUseCase = new GetUsageStatsUseCase();

const connectToTicketUseCase = new ConnectToTicketUseCase(chatKitJira);
const sendWidgetMessageUseCase = new SendWidgetMessageUseCase(chatKitJira);
const getSessionStatusUseCase = new GetSessionStatusUseCase(chatKitJira);

const handleJiraWebhookUseCase = new HandleJiraWebhookUseCase(chatKitJira);
const processDirectChatUseCase = new ProcessDirectChatUseCase(chatKitJira);

// ── Presentation ─────────────────────────────────────────────────────────────
const chatKitSessionController = new ChatKitSessionController(
  createSessionUseCase,
  refreshSessionUseCase,
  getSessionInfoUseCase,
  deleteSessionUseCase,
  getUsageStatsUseCase
);
const chatKitWidgetController = new ChatKitWidgetController(
  connectToTicketUseCase,
  sendWidgetMessageUseCase,
  getSessionStatusUseCase
);
const chatKitWebhookController = new ChatKitWebhookController(handleJiraWebhookUseCase, processDirectChatUseCase);

export const chatkitSessionRouter: Router = buildChatkitSessionRouter(chatKitSessionController);
export const chatkitWidgetRouter: Router = buildChatkitWidgetRouter(chatKitWidgetController);
export const chatkitWebhookRouter: Router = buildChatkitWebhookRouter(chatKitWebhookController, chatKitWidgetController);
