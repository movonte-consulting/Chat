import { Router, Request, Response } from 'express';

import { ConfigurationServiceAdapter } from './adaptadores/configuration-service.adapter';
import { OpenAiAssistantCatalogAdapter } from './adaptadores/openai-assistant-catalog.adapter';
import { WebhookSenderAdapter } from './adaptadores/webhook-sender.adapter';
import { RequesterJiraStatusesAdapter } from './adaptadores/requester-jira-statuses.adapter';

import { ConfigureWebhookUseCase } from '../application/configure-webhook.use-case';
import { TestWebhookUseCase } from '../application/test-webhook.use-case';
import { DisableWebhookUseCase } from '../application/disable-webhook.use-case';
import { GetWebhookStatusUseCase } from '../application/get-webhook-status.use-case';
import { ConfigureWebhookFilterUseCase } from '../application/configure-webhook-filter.use-case';
import { TestWebhookFilterUseCase } from '../application/test-webhook-filter.use-case';
import { ConfigureStatusBasedDisableUseCase } from '../application/configure-status-based-disable.use-case';
import { GetStatusBasedDisableConfigUseCase } from '../application/get-status-based-disable-config.use-case';
import { GetAvailableStatusesUseCase } from '../application/get-available-statuses.use-case';

import { WebhookAdminController } from './controladores/webhook-admin.controller';
import { buildWebhookAdminRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const configurationService = new ConfigurationServiceAdapter();
const assistantCatalog = new OpenAiAssistantCatalogAdapter();
const webhookSender = new WebhookSenderAdapter();
const requesterJiraStatuses = new RequesterJiraStatusesAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const configureWebhookUseCase = new ConfigureWebhookUseCase(configurationService, configurationService, assistantCatalog);
const testWebhookUseCase = new TestWebhookUseCase(configurationService, webhookSender);
const disableWebhookUseCase = new DisableWebhookUseCase(configurationService);
const getWebhookStatusUseCase = new GetWebhookStatusUseCase(configurationService, configurationService);
const configureWebhookFilterUseCase = new ConfigureWebhookFilterUseCase(configurationService);
const testWebhookFilterUseCase = new TestWebhookFilterUseCase(configurationService);
const configureStatusBasedDisableUseCase = new ConfigureStatusBasedDisableUseCase(configurationService);
const getStatusBasedDisableConfigUseCase = new GetStatusBasedDisableConfigUseCase(configurationService);
const getAvailableStatusesUseCase = new GetAvailableStatusesUseCase(requesterJiraStatuses);

// ── Presentation ─────────────────────────────────────────────────────────────
const webhookAdminController = new WebhookAdminController(
  configureWebhookUseCase,
  testWebhookUseCase,
  disableWebhookUseCase,
  getWebhookStatusUseCase,
  configureWebhookFilterUseCase,
  testWebhookFilterUseCase,
  configureStatusBasedDisableUseCase,
  getStatusBasedDisableConfigUseCase,
  getAvailableStatusesUseCase
);

export const webhookAdminRouter: Router = buildWebhookAdminRouter(webhookAdminController);

/**
 * Handler suelto reutilizado por el feature user-services (getUserAvailableStatuses) como fallback
 * cuando el usuario que llama no tiene credenciales propias de Jira (usa las credenciales que
 * vengan en el mismo req.user, igual que hacía el AdminController original).
 */
export function getAvailableStatuses(req: Request, res: Response): Promise<void> {
  return webhookAdminController.getAvailableStatuses(req, res);
}
