import { Router } from 'express';

import { UserLookupAdapter } from './adaptadores/user-lookup.adapter';
import { UserConfigurationServiceAdapter } from './adaptadores/user-configuration-service.adapter';
import { ServiceExistenceRepository } from './repositorios/service-existence.repository';
import { UserWebhookRepository } from './repositorios/user-webhook.repository';

import { GetWebhookStatusUseCase } from '../application/get-webhook-status.use-case';
import { ConfigureWebhookUseCase } from '../application/configure-webhook.use-case';
import { TestWebhookUseCase } from '../application/test-webhook.use-case';
import { DisableWebhookUseCase } from '../application/disable-webhook.use-case';
import { ConfigureWebhookFilterUseCase } from '../application/configure-webhook-filter.use-case';
import { GetSavedWebhooksUseCase } from '../application/get-saved-webhooks.use-case';
import { SaveWebhookUseCase } from '../application/save-webhook.use-case';
import { UpdateWebhookUseCase } from '../application/update-webhook.use-case';
import { DeleteWebhookUseCase } from '../application/delete-webhook.use-case';

import { UserWebhooksController } from './controladores/user-webhooks.controller';
import { buildUserWebhookRouter, buildUserWebhooksCrudRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const userLookup = new UserLookupAdapter();
const userWebhookConfig = new UserConfigurationServiceAdapter();
const serviceExistenceChecker = new ServiceExistenceRepository();
const userWebhookRepository = new UserWebhookRepository();

// ── Application ───────────────────────────────────────────────────────────────
const getWebhookStatusUseCase = new GetWebhookStatusUseCase(userLookup, userWebhookConfig);
const configureWebhookUseCase = new ConfigureWebhookUseCase(userLookup, userWebhookConfig);
const testWebhookUseCase = new TestWebhookUseCase(userLookup, userWebhookConfig);
const disableWebhookUseCase = new DisableWebhookUseCase(userLookup, userWebhookConfig);
const configureWebhookFilterUseCase = new ConfigureWebhookFilterUseCase(userLookup, userWebhookConfig);
const getSavedWebhooksUseCase = new GetSavedWebhooksUseCase(userLookup, userWebhookRepository);
const saveWebhookUseCase = new SaveWebhookUseCase(userLookup, serviceExistenceChecker, userWebhookRepository);
const updateWebhookUseCase = new UpdateWebhookUseCase(userLookup, serviceExistenceChecker, userWebhookRepository);
const deleteWebhookUseCase = new DeleteWebhookUseCase(userLookup, userWebhookRepository);

// ── Presentation ─────────────────────────────────────────────────────────────
const userWebhooksController = new UserWebhooksController(
  getWebhookStatusUseCase,
  configureWebhookUseCase,
  testWebhookUseCase,
  disableWebhookUseCase,
  configureWebhookFilterUseCase,
  getSavedWebhooksUseCase,
  saveWebhookUseCase,
  updateWebhookUseCase,
  deleteWebhookUseCase
);

export const userWebhookRouter: Router = buildUserWebhookRouter(userWebhooksController);
export const userWebhooksCrudRouter: Router = buildUserWebhooksCrudRouter(userWebhooksController);
