import { Router, Request, Response } from 'express';

import { SequelizeUserCredentialsAdapter } from './adaptadores/sequelize-user-credentials.adapter';
import { UserOpenAiServiceAdapter } from './adaptadores/user-openai-service.adapter';
import { UserJiraProjectsAdapter } from './adaptadores/user-jira-projects.adapter';
import { GlobalJiraStatusesAdapter } from './adaptadores/global-jira-statuses.adapter';
import { LegacyStatusesFallbackAdapter } from './adaptadores/legacy-statuses-fallback.adapter';
import { UserServiceConfigurationsRepository } from './repositorios/user-service-configurations.repository';
import { PublicActiveAssistantRepository } from './repositorios/public-active-assistant.repository';

import { GetUserDashboardUseCase } from '../application/get-user-dashboard.use-case';
import { CreateUserServiceUseCase } from '../application/create-user-service.use-case';
import { GetUserServicesUseCase } from '../application/get-user-services.use-case';
import { UpdateUserServiceUseCase } from '../application/update-user-service.use-case';
import { DeleteUserServiceUseCase } from '../application/delete-user-service.use-case';
import { ChatWithUserServiceUseCase } from '../application/chat-with-user-service.use-case';
import { GetUserAvailableStatusesUseCase } from '../application/get-user-available-statuses.use-case';
import { GetUserAssistantsUseCase } from '../application/get-user-assistants.use-case';
import { GetUserProjectsUseCase } from '../application/get-user-projects.use-case';
import { GetActiveAssistantForUserServiceUseCase } from '../application/get-active-assistant-for-user-service.use-case';

import { UserServicesController } from './controladores/user-services.controller';
import { buildUserServicesRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const userCredentials = new SequelizeUserCredentialsAdapter();
const userAssistantCatalog = new UserOpenAiServiceAdapter();
const userJiraProjects = new UserJiraProjectsAdapter();
const globalJiraStatuses = new GlobalJiraStatusesAdapter();
const legacyStatusesFallback = new LegacyStatusesFallbackAdapter();
const userServiceConfigurations = new UserServiceConfigurationsRepository();
const publicActiveAssistantRepository = new PublicActiveAssistantRepository();

// ── Application ───────────────────────────────────────────────────────────────
const getUserDashboardUseCase = new GetUserDashboardUseCase(userCredentials, userAssistantCatalog, userJiraProjects, userServiceConfigurations);
const createUserServiceUseCase = new CreateUserServiceUseCase(userCredentials, userAssistantCatalog, userServiceConfigurations);
const getUserServicesUseCase = new GetUserServicesUseCase(userServiceConfigurations);
const updateUserServiceUseCase = new UpdateUserServiceUseCase(userCredentials, userAssistantCatalog, userServiceConfigurations);
const deleteUserServiceUseCase = new DeleteUserServiceUseCase(userServiceConfigurations);
const chatWithUserServiceUseCase = new ChatWithUserServiceUseCase(userCredentials, userAssistantCatalog);
const getUserAvailableStatusesUseCase = new GetUserAvailableStatusesUseCase(userCredentials, globalJiraStatuses, legacyStatusesFallback);
const getUserAssistantsUseCase = new GetUserAssistantsUseCase(userCredentials, userAssistantCatalog);
const getUserProjectsUseCase = new GetUserProjectsUseCase(userCredentials, userJiraProjects);
const getActiveAssistantForUserServiceUseCase = new GetActiveAssistantForUserServiceUseCase(publicActiveAssistantRepository);

// ── Presentation ─────────────────────────────────────────────────────────────
const userServicesController = new UserServicesController(
  getUserDashboardUseCase,
  createUserServiceUseCase,
  getUserServicesUseCase,
  updateUserServiceUseCase,
  deleteUserServiceUseCase,
  chatWithUserServiceUseCase,
  getUserAvailableStatusesUseCase,
  getUserAssistantsUseCase,
  getUserProjectsUseCase,
  getActiveAssistantForUserServiceUseCase
);

export const userServicesRouter: Router = buildUserServicesRouter(userServicesController);

/** Handlers sueltos reutilizados por scripts de diagnóstico (p.ej. src/scripts/test-user-endpoints.ts). */
export function getUserDashboard(req: Request, res: Response): Promise<void> {
  return userServicesController.getUserDashboard(req, res);
}
export function getUserAssistants(req: Request, res: Response): Promise<void> {
  return userServicesController.getUserAssistants(req, res);
}
export function getUserProjects(req: Request, res: Response): Promise<void> {
  return userServicesController.getUserProjects(req, res);
}
