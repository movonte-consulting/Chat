import { Router } from 'express';

import { WidgetJiraAccountAdapter } from './adaptadores/widget-jira-account.adapter';
import { UserJiraScopedAdapter } from './adaptadores/user-jira-scoped.adapter';
import { GlobalJiraAdapter } from './adaptadores/global-jira.adapter';
import { TicketDisableRegistryAdapter } from './adaptadores/ticket-disable-registry.adapter';

import { ConnectToTicketUseCase } from '../application/connect-to-ticket.use-case';
import { SendMessageToJiraUseCase } from '../application/send-message-to-jira.use-case';
import { GetConversationHistoryUseCase } from '../application/get-conversation-history.use-case';
import { SearchTicketsByEmailUseCase } from '../application/search-tickets-by-email.use-case';
import { UpdateTicketStatusUseCase } from '../application/update-ticket-status.use-case';
import { GetTicketDetailsUseCase } from '../application/get-ticket-details.use-case';
import { CheckNewMessagesUseCase } from '../application/check-new-messages.use-case';
import { HealthCheckUseCase } from '../application/health-check.use-case';
import { CheckAssistantStatusUseCase } from '../application/check-assistant-status.use-case';

import { WidgetIntegrationController } from './controladores/widget-integration.controller';
import { buildWidgetIntegrationRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const widgetJiraAccountResolver = new WidgetJiraAccountAdapter();
const widgetScopedJira = new UserJiraScopedAdapter();
const globalJira = new GlobalJiraAdapter();
const ticketDisableRegistry = new TicketDisableRegistryAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const connectToTicketUseCase = new ConnectToTicketUseCase(widgetJiraAccountResolver, widgetScopedJira, globalJira);
const sendMessageToJiraUseCase = new SendMessageToJiraUseCase(widgetJiraAccountResolver, widgetScopedJira, ticketDisableRegistry);
const getConversationHistoryUseCase = new GetConversationHistoryUseCase(globalJira);
const searchTicketsByEmailUseCase = new SearchTicketsByEmailUseCase(globalJira);
const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(globalJira);
const getTicketDetailsUseCase = new GetTicketDetailsUseCase(globalJira);
const checkNewMessagesUseCase = new CheckNewMessagesUseCase(globalJira);
const healthCheckUseCase = new HealthCheckUseCase(globalJira);
const checkAssistantStatusUseCase = new CheckAssistantStatusUseCase(ticketDisableRegistry);

// ── Presentation ─────────────────────────────────────────────────────────────
const widgetIntegrationController = new WidgetIntegrationController(
  connectToTicketUseCase,
  sendMessageToJiraUseCase,
  getConversationHistoryUseCase,
  searchTicketsByEmailUseCase,
  updateTicketStatusUseCase,
  getTicketDetailsUseCase,
  checkNewMessagesUseCase,
  healthCheckUseCase,
  checkAssistantStatusUseCase
);

export const widgetIntegrationRouter: Router = buildWidgetIntegrationRouter(widgetIntegrationController);
