/**
 * Composition root for the whatsapp feature: wires infrastructure adapters into
 * the application use cases and the controller, and exposes the public surface
 * other features are allowed to depend on (whatsappRouter, notifyFromJiraUseCase).
 */

import { Router } from 'express';

import { ConversationRepository } from './repositorios/conversation.repository';
import { WhatsAppSenderAdapter } from './adaptadores/whatsapp-sender.adapter';
import { GenericAgentAdapter } from './adaptadores/generic-agent.adapter';
import { RoutableServiceProviderAdapter } from './adaptadores/routable-service-provider.adapter';
import { TicketCreatorAdapter } from './adaptadores/ticket-creator.adapter';
import { JiraCommenterAdapter } from './adaptadores/jira-commenter.adapter';
import { UserCredentialsAdapter } from './adaptadores/user-credentials.adapter';

import { AddMessageToTicketUseCase } from '../application/add-message-to-ticket.use-case';
import { SwitchToServiceUseCase } from '../application/switch-to-service.use-case';
import { RespondWithGenericAgentUseCase } from '../application/respond-with-generic-agent.use-case';
import { HandleTextMessageUseCase } from '../application/handle-text-message.use-case';
import { HandleInteractiveReplyUseCase } from '../application/handle-interactive-reply.use-case';
import { NotifyFromJiraUseCase } from '../application/notify-from-jira.use-case';

import { WhatsAppController } from './controladores/whatsapp.controller';
import { buildWhatsAppRouter } from './router';

const DEFAULT_USER_ID = parseInt(process.env.WHATSAPP_DEFAULT_USER_ID || '0', 10);

// ── Infrastructure (adapters/repositories) ──────────────────────────────────
const conversationRepository = new ConversationRepository();
const whatsappSender = new WhatsAppSenderAdapter();
const genericAgent = new GenericAgentAdapter(conversationRepository);
const routableServiceProvider = new RoutableServiceProviderAdapter();
const ticketCreator = new TicketCreatorAdapter();
const jiraCommenter = new JiraCommenterAdapter();
const userCredentialsProvider = new UserCredentialsAdapter();

// ── Application (use cases) ─────────────────────────────────────────────────
const addMessageToTicket = new AddMessageToTicketUseCase(jiraCommenter);
const switchToService = new SwitchToServiceUseCase(
  ticketCreator, conversationRepository, whatsappSender, addMessageToTicket
);
const respondWithGenericAgent = new RespondWithGenericAgentUseCase(
  userCredentialsProvider, genericAgent, whatsappSender, switchToService
);
const handleTextMessage = new HandleTextMessageUseCase(
  conversationRepository, routableServiceProvider, whatsappSender,
  switchToService, respondWithGenericAgent, addMessageToTicket,
  DEFAULT_USER_ID
);
const handleInteractiveReply = new HandleInteractiveReplyUseCase(
  conversationRepository, switchToService, DEFAULT_USER_ID
);
export const notifyFromJiraUseCase = new NotifyFromJiraUseCase(conversationRepository, whatsappSender);

// ── Presentation (controller + router) ──────────────────────────────────────
const whatsAppController = new WhatsAppController(handleTextMessage, handleInteractiveReply);
export const whatsappRouter: Router = buildWhatsAppRouter(whatsAppController);
