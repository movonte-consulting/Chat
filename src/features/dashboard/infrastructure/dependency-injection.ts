import { Router } from 'express';

import { OpenAiAssistantCatalogAdapter } from './adaptadores/openai-assistant-catalog.adapter';
import { RequesterJiraProjectsRepository } from './repositorios/requester-jira-projects.repository';
import { ActiveProjectRegistryRepository } from './repositorios/active-project-registry.repository';
import { ActiveServiceConfigurationsRepository } from './repositorios/active-service-configurations.repository';

import { GetDashboardUseCase } from '../application/get-dashboard.use-case';

import { DashboardController } from './controladores/dashboard.controller';
import { buildDashboardRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const assistantCatalog = new OpenAiAssistantCatalogAdapter();
const requesterJiraProjects = new RequesterJiraProjectsRepository();
const activeProjectRegistry = new ActiveProjectRegistryRepository();
const activeServiceConfigurations = new ActiveServiceConfigurationsRepository();

// ── Application ───────────────────────────────────────────────────────────────
const getDashboardUseCase = new GetDashboardUseCase(
  assistantCatalog,
  requesterJiraProjects,
  activeProjectRegistry,
  activeServiceConfigurations
);

// ── Presentation ─────────────────────────────────────────────────────────────
const dashboardController = new DashboardController(getDashboardUseCase);

export const dashboardRouter: Router = buildDashboardRouter(dashboardController);
