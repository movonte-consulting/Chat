/**
 * Composition root for the tickets feature: wires infrastructure adapters into
 * the application use cases and the controllers, and exposes the public surface
 * other features/controllers are allowed to depend on (ticketsRouter,
 * createTicketForWhatsApp, getAssistantJiraAccount, getWidgetJiraAccount).
 */

import { Router } from 'express';

import { ServiceConfigRepository } from './repositorios/service-config.repository';
import { JiraAccountRepository } from './repositorios/jira-account.repository';
import { JiraIssueCreatorAdapter } from './adaptadores/jira-issue-creator.adapter';
import { UserJiraCredentialsAdapter } from './adaptadores/user-jira-credentials.adapter';

import { CreateTicketForServiceUseCase } from '../application/create-ticket-for-service.use-case';
import { CreateTicketForWhatsAppUseCase } from '../application/create-ticket-for-whatsapp.use-case';
import { GetServiceInfoUseCase } from '../application/get-service-info.use-case';
import { GetServiceJiraAccountsUseCase } from '../application/get-service-jira-accounts.use-case';
import { UpsertServiceJiraAccountsUseCase } from '../application/upsert-service-jira-accounts.use-case';
import { DeleteServiceJiraAccountsUseCase } from '../application/delete-service-jira-accounts.use-case';
import { GetAssistantJiraAccountUseCase } from '../application/get-assistant-jira-account.use-case';
import { GetWidgetJiraAccountUseCase } from '../application/get-widget-jira-account.use-case';
import { CustomerInfo } from '../domain/modelos/ticket.model';

import { TicketController } from './controladores/ticket.controller';
import { JiraAccountsController } from './controladores/jira-accounts.controller';
import { buildTicketsRouter } from './router';

// ── Infrastructure (adapters/repositories) ──────────────────────────────────
const serviceConfigRepository = new ServiceConfigRepository();
const jiraAccountRepository = new JiraAccountRepository();
const jiraIssueCreator = new JiraIssueCreatorAdapter();
const userJiraCredentialsProvider = new UserJiraCredentialsAdapter();

// ── Application (use cases) ─────────────────────────────────────────────────
const createTicketForServiceUseCase = new CreateTicketForServiceUseCase(
  serviceConfigRepository, jiraAccountRepository, jiraIssueCreator
);
const createTicketForWhatsAppUseCase = new CreateTicketForWhatsAppUseCase(
  userJiraCredentialsProvider, jiraAccountRepository, serviceConfigRepository, jiraIssueCreator
);
const getServiceInfoUseCase = new GetServiceInfoUseCase(serviceConfigRepository);
const getServiceJiraAccountsUseCase = new GetServiceJiraAccountsUseCase(jiraAccountRepository);
const upsertServiceJiraAccountsUseCase = new UpsertServiceJiraAccountsUseCase(jiraAccountRepository);
const deleteServiceJiraAccountsUseCase = new DeleteServiceJiraAccountsUseCase(jiraAccountRepository);
const getAssistantJiraAccountUseCase = new GetAssistantJiraAccountUseCase(jiraAccountRepository);
const getWidgetJiraAccountUseCase = new GetWidgetJiraAccountUseCase(jiraAccountRepository);

// ── Presentation (controllers + router) ─────────────────────────────────────
export const ticketController = new TicketController(createTicketForServiceUseCase, getServiceInfoUseCase);
const jiraAccountsController = new JiraAccountsController(
  getServiceJiraAccountsUseCase, upsertServiceJiraAccountsUseCase, deleteServiceJiraAccountsUseCase
);

export const ticketsRouter: Router = buildTicketsRouter(ticketController, jiraAccountsController);

// ── Funciones públicas para otros features (whatsapp, chatbot, widget) ──────
export async function createTicketForWhatsApp(
  userId: number,
  serviceId: string,
  customerInfo: CustomerInfo
): Promise<{ issueKey: string }> {
  return createTicketForWhatsAppUseCase.execute(userId, serviceId, customerInfo);
}

export async function getAssistantJiraAccount(userId: number, serviceId: string) {
  return getAssistantJiraAccountUseCase.execute(userId, serviceId);
}

export async function getWidgetJiraAccount(userId: number, serviceId: string) {
  return getWidgetJiraAccountUseCase.execute(userId, serviceId);
}
