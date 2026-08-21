import { Router, Request, Response } from 'express';
import { authenticateToken, requirePermission } from '../../../middleware/auth';

import { RequesterJiraProjectsAdapter } from './adaptadores/requester-jira-projects.adapter';
import { ActiveProjectRegistryAdapter } from './adaptadores/active-project-registry.adapter';

import { ListProjectsUseCase } from '../application/list-projects.use-case';
import { SetActiveProjectUseCase } from '../application/set-active-project.use-case';
import { GetActiveProjectUseCase } from '../application/get-active-project.use-case';
import { GetProjectDetailsUseCase } from '../application/get-project-details.use-case';
import { TestJiraConnectionUseCase } from '../application/test-jira-connection.use-case';

import { ProjectsController } from './controladores/projects.controller';
import { buildProjectsRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const requesterJiraProjects = new RequesterJiraProjectsAdapter();
const activeProjectRegistry = new ActiveProjectRegistryAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const listProjectsUseCase = new ListProjectsUseCase(requesterJiraProjects);
const setActiveProjectUseCase = new SetActiveProjectUseCase(requesterJiraProjects, activeProjectRegistry);
const getActiveProjectUseCase = new GetActiveProjectUseCase(activeProjectRegistry);
const getProjectDetailsUseCase = new GetProjectDetailsUseCase(requesterJiraProjects);
const testJiraConnectionUseCase = new TestJiraConnectionUseCase(requesterJiraProjects);

// ── Presentation ─────────────────────────────────────────────────────────────
const projectsController = new ProjectsController(
  listProjectsUseCase,
  setActiveProjectUseCase,
  getActiveProjectUseCase,
  getProjectDetailsUseCase,
  testJiraConnectionUseCase
);

export const projectsRouter: Router = buildProjectsRouter(projectsController);

/** Handler suelto para /api/admin/jira/test-connection (prefijo propio, no usado por nada más). */
export const testJiraConnectionMiddlewares = [authenticateToken, requirePermission('aiEnabledProjects')];

export function testJiraConnection(req: Request, res: Response): Promise<void> {
  return projectsController.testJiraConnection(req, res);
}
