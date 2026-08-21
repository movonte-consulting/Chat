import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../../middleware/auth';
import { ProjectsController } from './controladores/projects.controller';

/** Montado en /api/admin/projects. testJiraConnection NO va aquí — vive sola en /api/admin/jira/test-connection. */
export function buildProjectsRouter(controller: ProjectsController): Router {
  const router = Router();

  router.get('/', authenticateToken, requirePermission('aiEnabledProjects'), controller.listProjects.bind(controller));
  router.post('/set-active', authenticateToken, requirePermission('aiEnabledProjects'), controller.setActiveProject.bind(controller));
  router.get('/active', authenticateToken, requirePermission('aiEnabledProjects'), controller.getActiveProject.bind(controller));
  router.get('/:projectKey', authenticateToken, requirePermission('aiEnabledProjects'), controller.getProjectDetails.bind(controller));

  return router;
}
