import { Router, Request, Response } from 'express';

import { ServiceConfigRepositoryAdapter } from './adaptadores/service-config-repository.adapter';
import { GlobalServiceRegistryAdapter } from './adaptadores/global-service-registry.adapter';
import { AssistantCatalogAdapter } from './adaptadores/assistant-catalog.adapter';

import { GetServiceConfigurationUseCase } from '../application/get-service-configuration.use-case';
import { UpdateServiceConfigurationUseCase } from '../application/update-service-configuration.use-case';
import { ToggleServiceUseCase } from '../application/toggle-service.use-case';
import { AddServiceUseCase } from '../application/add-service.use-case';
import { RemoveServiceUseCase } from '../application/remove-service.use-case';
import { GetActiveAssistantForServiceUseCase } from '../application/get-active-assistant-for-service.use-case';

import { ServiceConfigController } from './controladores/service-config.controller';
import { buildServiceConfigRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const serviceConfigRepository = new ServiceConfigRepositoryAdapter();
const globalServiceRegistry = new GlobalServiceRegistryAdapter();
const assistantCatalog = new AssistantCatalogAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const getServiceConfigurationUseCase = new GetServiceConfigurationUseCase(serviceConfigRepository);
const updateServiceConfigurationUseCase = new UpdateServiceConfigurationUseCase(serviceConfigRepository, assistantCatalog);
const toggleServiceUseCase = new ToggleServiceUseCase(globalServiceRegistry);
const addServiceUseCase = new AddServiceUseCase(globalServiceRegistry, assistantCatalog);
const removeServiceUseCase = new RemoveServiceUseCase(globalServiceRegistry);
const getActiveAssistantForServiceUseCase = new GetActiveAssistantForServiceUseCase(globalServiceRegistry);

// ── Presentation ─────────────────────────────────────────────────────────────
const serviceConfigController = new ServiceConfigController(
  getServiceConfigurationUseCase,
  updateServiceConfigurationUseCase,
  toggleServiceUseCase,
  addServiceUseCase,
  removeServiceUseCase,
  getActiveAssistantForServiceUseCase
);

export const serviceConfigRouter: Router = buildServiceConfigRouter(serviceConfigController);

/** Handler suelto para la ruta pública /api/services/:serviceId/assistant (fuera del router de arriba). */
export function getActiveAssistantForService(req: Request, res: Response): Promise<void> {
  return serviceConfigController.getActiveAssistantForService(req, res);
}
