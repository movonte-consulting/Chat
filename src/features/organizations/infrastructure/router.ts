import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../../middleware/auth';
import { OrganizationsController } from './controladores/organizations.controller';

export function buildOrganizationsRouter(controller: OrganizationsController): Router {
  const router = Router();
  router.get('/', authenticateToken, requireAdmin, controller.getOrganizations.bind(controller));
  return router;
}
