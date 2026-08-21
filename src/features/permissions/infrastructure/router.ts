import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../../middleware/auth';
import { PermissionsController } from './controladores/permissions.controller';

/** Montado en /api/admin/users — comparte prefijo con el feature user-management (CRUD de usuarios). */
export function buildPermissionsRouter(controller: PermissionsController): Router {
  const router = Router();

  router.get('/permissions', authenticateToken, requireAdmin, controller.getUsersWithPermissions.bind(controller));
  router.get('/:userId/permissions', authenticateToken, requireAdmin, controller.getUserPermissions.bind(controller));
  router.put('/:userId/permissions', authenticateToken, requireAdmin, controller.updateUserPermissions.bind(controller));

  return router;
}
