import { Router } from 'express';

import { UserWebhookRepository } from './repositorios/user-webhook.repository';
import { ServiceExistenceRepository } from './repositorios/service-existence.repository';
import { UserLookupAdapter } from './adaptadores/user-lookup.adapter';

import { GetAllWebhooksUseCase } from '../application/get-all-webhooks.use-case';
import { CreateWebhookUseCase } from '../application/create-webhook.use-case';
import { UpdateWebhookUseCase } from '../application/update-webhook.use-case';
import { DeleteWebhookUseCase } from '../application/delete-webhook.use-case';

import { AdminWebhooksController } from './controladores/admin-webhooks.controller';
import { buildAdminWebhooksRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const webhookRepository = new UserWebhookRepository();
const serviceExistenceChecker = new ServiceExistenceRepository();
const userLookup = new UserLookupAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const getAllWebhooksUseCase = new GetAllWebhooksUseCase(webhookRepository);
const createWebhookUseCase = new CreateWebhookUseCase(webhookRepository, userLookup, serviceExistenceChecker);
const updateWebhookUseCase = new UpdateWebhookUseCase(webhookRepository, serviceExistenceChecker);
const deleteWebhookUseCase = new DeleteWebhookUseCase(webhookRepository);

// ── Presentation ─────────────────────────────────────────────────────────────
const adminWebhooksController = new AdminWebhooksController(
  getAllWebhooksUseCase,
  createWebhookUseCase,
  updateWebhookUseCase,
  deleteWebhookUseCase
);

export const adminWebhooksRouter: Router = buildAdminWebhooksRouter(adminWebhooksController);
